import assert from "node:assert/strict";
import test from "node:test";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { CreateUserUseCase } from "./create-user.use-case";
import { BootstrapUsersService } from "./bootstrap-users.service";
import { AdminSetUserPasswordUseCase, ChangeOwnPasswordUseCase, DeleteUserUseCase, SetUserActiveUseCase, UpdateUserUseCase } from "./manage-user.use-cases";
import { hashPassword, verifyPassword } from "./password-hasher";
import { decodeSessionToken, encodeSessionToken } from "./session-token";
import { User, UserRole } from "../domain/user";
import { CreateUserData, UserRepository } from "../domain/user.repository";
import { AuthGuard } from "../presentation/auth.guard";
import { IS_PUBLIC_KEY, ROLES_KEY } from "../auth.tokens";
import { canAccessOrder } from "../../orders/application/order-access";

const USER_ID = "50000000-0000-4000-8000-000000000001";
const OTHER_ID = "50000000-0000-4000-8000-000000000002";

function memoryUsers(initial: User[] = []): UserRepository & { users: User[] } {
  const users = [...initial];
  return {
    users,
    findById: async (id) => users.find((user) => user.id === id) ?? null,
    findByEmail: async (email) => users.find((user) => user.email === email) ?? null,
    findAll: async () => users,
    create: async (data: CreateUserData) => {
      const user: User = { id: `50000000-0000-4000-8000-00000000010${users.length}`, active: true, sessionVersion: 0, createdAt: new Date(), ...data };
      users.push(user);
      return user;
    },
    delete: async (id) => {
      users.splice(users.findIndex((current) => current.id === id), 1);
    },
    updatePassword: async (id, passwordHash) => {
      const user = users.find((current) => current.id === id)!;
      Object.assign(user, { passwordHash, sessionVersion: user.sessionVersion + 1 });
      return user;
    },
    update: async (id, data) => {
      const user = users.find((current) => current.id === id)!;
      Object.assign(user, data);
      return user;
    }
  };
}

async function makeUser(overrides: Partial<User> = {}): Promise<User> {
  return { id: USER_ID, name: "Demo", email: "demo@store.local", passwordHash: await hashPassword("demo12345"), role: UserRole.USER, active: true, sessionVersion: 0, createdAt: new Date(), ...overrides };
}

function contextFor(cookie: string | undefined, metadata: Record<string, unknown>) {
  const request: { headers: { cookie?: string }; user?: unknown } = { headers: { cookie } };
  const reflector = { getAllAndOverride: (key: string) => metadata[key] } as unknown as Reflector;
  const context = { getHandler: () => null, getClass: () => null, switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
  return { request, reflector, context };
}

test.beforeEach(() => {
  process.env.AUTH_SECRET = "test-secret";
});

test("hash de senha valida a senha correta e rejeita a errada", async () => {
  const hash = await hashPassword("segredo123");
  assert.match(hash, /^scrypt\$/);
  assert.equal(await verifyPassword("segredo123", hash), true);
  assert.equal(await verifyPassword("errada", hash), false);
  assert.equal(await verifyPassword("segredo123", "texto-puro"), false);
});

test("token de sessao rejeita assinatura adulterada e expiracao", () => {
  const exp = Math.floor(Date.now() / 1000) + 60;
  const token = encodeSessionToken("s1", { sub: USER_ID, role: UserRole.USER, ver: 0, exp });
  assert.equal(decodeSessionToken("s1", token)?.sub, USER_ID);
  assert.equal(decodeSessionToken("outro", token), null);

  const [, signature] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ sub: USER_ID, role: UserRole.ADMIN, ver: 0, exp })).toString("base64url");
  assert.equal(decodeSessionToken("s1", `${forged}.${signature}`), null);
  assert.equal(decodeSessionToken("s1", token, (exp + 1) * 1000), null);
});

test("login aceita credenciais validas e recusa senha errada ou usuario inativo", async () => {
  const users = memoryUsers([await makeUser()]);
  const auth = new AuthService(users);

  const session = await auth.login(" DEMO@store.local ", "demo12345");
  assert.equal(session?.user.role, UserRole.USER);
  assert.match(session!.cookie, /^store_session=.+; Path=\/; HttpOnly; SameSite=Lax/);
  assert.equal(await auth.login("demo@store.local", "errada"), null);
  assert.equal(await auth.login("naoexiste@store.local", "demo12345"), null);

  users.users[0].active = false;
  assert.equal(await auth.login("demo@store.local", "demo12345"), null);
});

test("authenticate usa o papel atual do banco, nao o do token", async () => {
  const users = memoryUsers([await makeUser()]);
  const auth = new AuthService(users);
  const session = await auth.login("demo@store.local", "demo12345");
  const cookie = session!.cookie.split(";")[0];

  users.users[0].role = UserRole.ADMIN;
  assert.equal((await auth.authenticate(cookie))?.role, UserRole.ADMIN);
  users.users[0].active = false;
  assert.equal(await auth.authenticate(cookie), null);
});

test("guard: rota publica passa, sem sessao da 401, USER em rota admin da 403, ADMIN passa", async () => {
  const users = memoryUsers([await makeUser(), await makeUser({ id: OTHER_ID, email: "admin@store.local", role: UserRole.ADMIN })]);
  const auth = new AuthService(users);
  const userCookie = (await auth.login("demo@store.local", "demo12345"))!.cookie.split(";")[0];
  const adminCookie = (await auth.login("admin@store.local", "demo12345"))!.cookie.split(";")[0];

  const open = contextFor(undefined, { [IS_PUBLIC_KEY]: true });
  assert.equal(await new AuthGuard(open.reflector, auth).canActivate(open.context), true);

  const anonymous = contextFor(undefined, {});
  await assert.rejects(() => new AuthGuard(anonymous.reflector, auth).canActivate(anonymous.context), UnauthorizedException);

  const userOnAdmin = contextFor(userCookie, { [ROLES_KEY]: [UserRole.ADMIN] });
  await assert.rejects(() => new AuthGuard(userOnAdmin.reflector, auth).canActivate(userOnAdmin.context), ForbiddenException);

  const userOnPrivate = contextFor(userCookie, {});
  assert.equal(await new AuthGuard(userOnPrivate.reflector, auth).canActivate(userOnPrivate.context), true);
  assert.equal((userOnPrivate.request.user as { id: string }).id, USER_ID);

  const adminOnUserRoute = contextFor(adminCookie, { [ROLES_KEY]: [UserRole.USER] });
  assert.equal(await new AuthGuard(adminOnUserRoute.reflector, auth).canActivate(adminOnUserRoute.context), true);
});

test("criar usuario normaliza e-mail, exige senha minima e bloqueia duplicado", async () => {
  const users = memoryUsers();
  const useCase = new CreateUserUseCase(users);

  const created = await useCase.execute({ name: " Ana ", email: "ANA@Store.local", password: "12345678", role: UserRole.USER });
  assert.equal(created.email, "ana@store.local");
  assert.equal(created.name, "Ana");
  assert.equal(await verifyPassword("12345678", created.passwordHash), true);
  await assert.rejects(() => useCase.execute({ name: "Ana", email: "ana@store.local", password: "12345678", role: UserRole.USER }), /Ja existe/);
  await assert.rejects(() => useCase.execute({ name: "Bia", email: "bia@store.local", password: "123", role: UserRole.USER }), /ao menos 8/);
});

test("bootstrap cria admin e demo do ambiente e sincroniza senha/papel do admin", async () => {
  Object.assign(process.env, { ADMIN_EMAIL: "Admin@Store.local", ADMIN_PASSWORD: "admin-pass-1", DEMO_USER_EMAIL: "demo@store.local", DEMO_USER_PASSWORD: "demo-pass-1" });
  const users = memoryUsers();
  const service = new BootstrapUsersService(users);

  await service.onApplicationBootstrap();
  assert.deepEqual(users.users.map((user) => [user.email, user.role]), [["admin@store.local", UserRole.ADMIN], ["demo@store.local", UserRole.USER]]);

  users.users[0].role = UserRole.USER;
  process.env.ADMIN_PASSWORD = "admin-pass-2";
  await service.onApplicationBootstrap();
  assert.equal(users.users.length, 2);
  assert.equal(users.users[0].role, UserRole.ADMIN);
  assert.equal(await verifyPassword("admin-pass-2", users.users[0].passwordHash), true);
});

test("acesso a pedido: dono e admin sim, outro usuario e pedido sem dono nao", () => {
  assert.equal(canAccessOrder({ id: USER_ID, role: UserRole.USER }, { userId: USER_ID }), true);
  assert.equal(canAccessOrder({ id: OTHER_ID, role: UserRole.USER }, { userId: USER_ID }), false);
  assert.equal(canAccessOrder({ id: OTHER_ID, role: UserRole.USER }, { userId: null }), false);
  assert.equal(canAccessOrder({ id: OTHER_ID, role: UserRole.ADMIN }, { userId: null }), true);
});

test("trocar a propria senha exige a senha atual e derruba sessoes antigas", async () => {
  process.env.ADMIN_EMAIL = "admin@store.local";
  const users = memoryUsers([await makeUser()]);
  const auth = new AuthService(users);
  const oldCookie = (await auth.login("demo@store.local", "demo12345"))!.cookie.split(";")[0];
  const useCase = new ChangeOwnPasswordUseCase(users);

  await assert.rejects(() => useCase.execute({ userId: USER_ID, currentPassword: "errada", newPassword: "nova-senha-1" }), /Senha atual incorreta/);
  await assert.rejects(() => useCase.execute({ userId: USER_ID, currentPassword: "demo12345", newPassword: "curta" }), /ao menos 8/);
  await assert.rejects(() => useCase.execute({ userId: USER_ID, currentPassword: "demo12345", newPassword: "demo12345" }), /diferente/);

  const updated = await useCase.execute({ userId: USER_ID, currentPassword: "demo12345", newPassword: "nova-senha-1" });
  assert.equal(await auth.authenticate(oldCookie), null);
  const newCookie = auth.issueSession(updated).cookie.split(";")[0];
  assert.equal((await auth.authenticate(newCookie))?.id, USER_ID);
  assert.ok(await auth.login("demo@store.local", "nova-senha-1"));
});

test("admin ativa/desativa e redefine senha de outros, mas nao a propria nem a do admin principal", async () => {
  process.env.ADMIN_EMAIL = "admin@store.local";
  const users = memoryUsers([await makeUser(), await makeUser({ id: OTHER_ID, email: "admin@store.local", role: UserRole.ADMIN })]);
  const auth = new AuthService(users);
  const userCookie = (await auth.login("demo@store.local", "demo12345"))!.cookie.split(";")[0];
  const setActive = new SetUserActiveUseCase(users);
  const setPassword = new AdminSetUserPasswordUseCase(users);
  const ADMIN2 = "50000000-0000-4000-8000-000000000003";

  await setActive.execute({ actorId: ADMIN2, userId: USER_ID, active: false });
  assert.equal(await auth.authenticate(userCookie), null);
  assert.equal(await auth.login("demo@store.local", "demo12345"), null);
  await setActive.execute({ actorId: ADMIN2, userId: USER_ID, active: true });
  assert.ok(await auth.login("demo@store.local", "demo12345"));

  await setPassword.execute({ actorId: ADMIN2, userId: USER_ID, newPassword: "redefinida-1" });
  assert.ok(await auth.login("demo@store.local", "redefinida-1"));

  await assert.rejects(() => setActive.execute({ actorId: USER_ID, userId: USER_ID, active: false }), /propria conta/);
  await assert.rejects(() => setActive.execute({ actorId: ADMIN2, userId: OTHER_ID, active: false }), /admin principal/);
  await assert.rejects(() => setPassword.execute({ actorId: ADMIN2, userId: OTHER_ID, newPassword: "qualquer-1" }), /admin principal/);
  await assert.rejects(() => setPassword.execute({ actorId: USER_ID, userId: USER_ID, newPassword: "qualquer-1" }), /Minha conta/);
});

test("admin edita nome, e-mail e papel com as protecoes de si mesmo e do admin principal", async () => {
  process.env.ADMIN_EMAIL = "admin@store.local";
  const ADMIN2 = "50000000-0000-4000-8000-000000000003";
  const users = memoryUsers([
    await makeUser(),
    await makeUser({ id: OTHER_ID, email: "admin@store.local", role: UserRole.ADMIN }),
    await makeUser({ id: ADMIN2, email: "admin2@store.local", role: UserRole.ADMIN })
  ]);
  const auth = new AuthService(users);
  const useCase = new UpdateUserUseCase(users);
  const cookie = (await auth.login("demo@store.local", "demo12345"))!.cookie.split(";")[0];

  const updated = await useCase.execute({ actorId: ADMIN2, userId: USER_ID, name: " Novo Nome ", email: "NOVO@store.local", role: UserRole.ADMIN });
  assert.deepEqual([updated.name, updated.email, updated.role], ["Novo Nome", "novo@store.local", UserRole.ADMIN]);
  assert.equal((await auth.authenticate(cookie))?.role, UserRole.ADMIN);

  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: USER_ID, email: "admin2@store.local" }), /Ja existe/);
  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: USER_ID, name: "   " }), /nome/);
  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: ADMIN2, role: UserRole.USER }), /proprio papel/);
  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: OTHER_ID, role: UserRole.USER }), /admin principal/);
  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: OTHER_ID, email: "x@store.local" }), /admin principal/);
  assert.equal((await useCase.execute({ actorId: ADMIN2, userId: OTHER_ID, name: "Chefe" })).name, "Chefe");
  assert.equal((await useCase.execute({ actorId: ADMIN2, userId: ADMIN2, name: "Eu mesmo", role: UserRole.ADMIN })).name, "Eu mesmo");
});

test("admin exclui usuarios, exceto a si mesmo e o admin principal; sessao do excluido cai", async () => {
  process.env.ADMIN_EMAIL = "admin@store.local";
  const ADMIN2 = "50000000-0000-4000-8000-000000000003";
  const users = memoryUsers([await makeUser(), await makeUser({ id: OTHER_ID, email: "admin@store.local", role: UserRole.ADMIN })]);
  const auth = new AuthService(users);
  const cookie = (await auth.login("demo@store.local", "demo12345"))!.cookie.split(";")[0];
  const useCase = new DeleteUserUseCase(users);

  await assert.rejects(() => useCase.execute({ actorId: OTHER_ID, userId: OTHER_ID }), /propria conta/);
  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: OTHER_ID }), /admin principal/);
  await useCase.execute({ actorId: ADMIN2, userId: USER_ID });
  assert.equal(users.users.length, 1);
  assert.equal(await auth.authenticate(cookie), null);
  await assert.rejects(() => useCase.execute({ actorId: ADMIN2, userId: USER_ID }), /nao encontrado/);
});
