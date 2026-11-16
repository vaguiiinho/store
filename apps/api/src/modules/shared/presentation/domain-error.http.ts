import { BadRequestException } from "@nestjs/common";
import { DomainError } from "../domain/errors/domain-error";

/** Executa o caso de uso e traduz DomainError em HTTP 400. */
export async function runUseCase<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof DomainError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
