export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  sessionVersion: number;
  createdAt: Date;
};

export type AuthenticatedUser = Pick<User, "id" | "name" | "email" | "role">;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Admin principal definido por ADMIN_EMAIL: senha e status sao geridos pelo ambiente, nao pela UI. */
export function isPrimaryAdmin(user: Pick<User, "email">) {
  const primary = process.env.ADMIN_EMAIL;
  return Boolean(primary) && normalizeEmail(primary!) === user.email;
}
