# Deploy na VPS (Docker + CI/CD)

## Objetivo

Subir a loja em produção com PostgreSQL, API NestJS e frontend Next.js, publicados pelo CI/CD
(`.github/workflows/deploy.yml`) atrás do Nginx compartilhado da VPS (rede `projects-deploy-proxy`).

## Arquivos

- `.github/workflows/deploy.yml`: CI (lint, testes, build), push das imagens e deploy por SSH.
- `deploy/vps/docker-compose.yml`: stack de produção (postgres, api, web).
- `deploy/vps/deploy.sh`: valida, baixa imagens, faz backup do banco e sobe a versão.
- `deploy/vps/.env.example`: modelo do `.env` de produção.
- `deploy/vps/.env`: o `.env` de produção real, **só na sua máquina** (ignorado pelo Git).
- `deploy/vps/push-env.sh` (`npm run deploy:env`): envia o `deploy/vps/.env` para a VPS.
- `apps/api/Dockerfile`, `apps/web/Dockerfile`.

## Onde fica cada segredo

**GitHub Secrets** (só acesso do CI/CD):

| Secret | Uso |
| --- | --- |
| `DOCKER_HUB_USERNAME` | namespace das imagens `store-api`/`store-web` |
| `DOCKER_HUB_ACCESS_TOKEN` | push no Docker Hub |
| `VPS_HOST`, `VPS_USER` | destino do SSH |
| `VPS_SSH_KEY` | chave privada do deploy |
| `VPS_KNOWN_HOSTS` | saída de `ssh-keyscan -p <porta> <host>` |

**GitHub Variables**: `DEPLOY_ENABLED=true` liga o deploy; opcionais `VPS_PORT` (22) e `VPS_PATH` (`/root/projects/store`).

**`deploy/vps/.env`** (local): banco, `PUBLIC_ORIGIN`, `AUTH_SECRET`, admin, usuário demo e pagamento.
É a fonte da verdade; a VPS recebe uma cópia em `$VPS_PATH/.env`. O CD nunca sobrescreve esse arquivo,
só grava nele `APP_VERSION` e `DOCKER_HUB_USERNAME`.

## Primeiro deploy

1. Na sua máquina, crie e preencha o `.env` de produção:

   ```bash
   cp deploy/vps/.env.example deploy/vps/.env && chmod 600 deploy/vps/.env
   ```

   Obrigatórios: `POSTGRES_PASSWORD` (só letras e números: `openssl rand -hex 24`), `PUBLIC_ORIGIN`,
   `AUTH_SECRET` (`openssl rand -base64 48`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Envie para a VPS:

   ```bash
   npm run deploy:env -- root@SEU_HOST          # VPS_PORT e VPS_PATH opcionais no ambiente
   ```

3. Cadastre as 6 secrets e a variável `DEPLOY_ENABLED=true` no GitHub.
4. Faça push na `main`. Sem `.env` na VPS ou com obrigatória vazia, o `deploy.sh` para antes de mexer em qualquer container.

## Mudar um segredo depois

Edite `deploy/vps/.env` e rode `npm run deploy:env -- root@SEU_HOST --restart` (aplica na hora;
sem `--restart`, vale no próximo deploy). O `.env` anterior fica em `.env.bak` na VPS.

O script recusa mudar `POSTGRES_USER`/`POSTGRES_PASSWORD` quando o banco já existe: o volume
guarda a senha antiga. Para trocar, altere a senha dentro do Postgres primeiro.

Guarde uma cópia do `deploy/vps/.env` num gerenciador de senhas: ele não está no Git.

## Comandos na VPS

```bash
bash deploy.sh 1.0.42          # redeploy/rollback para uma versão já publicada
docker compose ps
docker compose logs -f api web
```

Nunca use `docker compose down -v`: apaga o volume do banco (`store-postgres-data`).
Backups automáticos ficam em `backups/` (últimos 10).

## Roteamento

- `https://SEU_HOST/` -> `store-web:3000`
- `https://SEU_HOST/api/*` -> `store-api:3001`

O Nginx fica no projeto de infra da VPS (`/root/projects/infra`); o `deploy.sh` o reinicia ao final.
