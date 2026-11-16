-- Incrementado ao trocar a senha: invalida sessoes emitidas antes da troca.
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
