import { User, UserRole } from "./user";

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit?: number): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: Partial<Pick<User, "name" | "email" | "passwordHash" | "role" | "active">>): Promise<User>;
  delete(id: string): Promise<void>;
  /** Troca o hash e incrementa sessionVersion (derruba sessoes antigas). */
  updatePassword(id: string, passwordHash: string): Promise<User>;
}
