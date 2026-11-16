#!/usr/bin/env bash
# Envia deploy/vps/.env (local, ignorado pelo Git) para a VPS.
# Uso: bash deploy/vps/push-env.sh <usuario@host> [--restart]
#   VPS_PORT (padrão 22) e VPS_PATH (padrão /root/projects/store) podem ser definidos no ambiente.
#   --restart: aplica na hora (docker compose up -d --wait); sem ele, vale no próximo deploy.
#
# Mantém na VPS o APP_VERSION e o DOCKER_HUB_USERNAME gravados pelo CD e guarda o .env anterior em .env.bak.
# Recusa trocar POSTGRES_PASSWORD/POSTGRES_USER se o banco já existe (o volume guarda a senha antiga).
set -euo pipefail

TARGET="${1:-}"
RESTART="${2:-}"
[ -n "$TARGET" ] || { echo "Uso: bash deploy/vps/push-env.sh <usuario@host> [--restart]" >&2; exit 2; }
[ -z "$RESTART" ] || [ "$RESTART" = "--restart" ] || { echo "Opção desconhecida: $RESTART" >&2; exit 2; }
PORT="${VPS_PORT:-22}"
REMOTE_PATH="${VPS_PATH:-/root/projects/store}"
ENV_FILE="$(dirname "$(readlink -f "$0")")/.env"

[ -f "$ENV_FILE" ] || { echo "Não achei $ENV_FILE. Crie com: cp deploy/vps/.env.example deploy/vps/.env" >&2; exit 1; }

missing=""
for var in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB PUBLIC_ORIGIN AUTH_SECRET ADMIN_EMAIL ADMIN_PASSWORD; do
  grep -qE "^${var}=['\"]?[^'\"[:space:]]" "$ENV_FILE" || missing="$missing $var"
done
[ -z "$missing" ] || { echo "Preencha no deploy/vps/.env:$missing" >&2; exit 1; }

# Linhas gerenciadas pelo CD não vão do local para a VPS.
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
grep -vE '^(APP_VERSION|DOCKER_HUB_USERNAME)=' "$ENV_FILE" > "$tmp"

ssh -p "$PORT" "$TARGET" "mkdir -p '$REMOTE_PATH'"
scp -q -P "$PORT" "$tmp" "$TARGET:$REMOTE_PATH/.env.new"

# shellcheck disable=SC2087 # expansão local de $REMOTE_PATH/$RESTART é intencional
ssh -p "$PORT" "$TARGET" bash -s <<EOF
set -euo pipefail
cd '$REMOTE_PATH'
chmod 600 .env.new
if [ -f .env ]; then
  if docker volume inspect store-postgres-data >/dev/null 2>&1; then
    for var in POSTGRES_USER POSTGRES_PASSWORD; do
      if [ "\$(grep -E "^\$var=" .env | tail -1)" != "\$(grep -E "^\$var=" .env.new | tail -1)" ]; then
        rm -f .env.new
        echo "ERRO: \$var mudou, mas o banco já existe com o valor antigo. Mantenha o valor atual ou troque a senha no Postgres antes." >&2
        exit 1
      fi
    done
  fi
  grep -E '^(APP_VERSION|DOCKER_HUB_USERNAME)=' .env >> .env.new || true
  cp .env .env.bak && chmod 600 .env.bak
fi
mv .env.new .env
echo ".env atualizado em $REMOTE_PATH (anterior em .env.bak)"
if [ '$RESTART' = '--restart' ]; then
  if grep -q '^APP_VERSION=' .env && [ -f docker-compose.yml ]; then
    docker compose up -d --wait --wait-timeout 300
  else
    echo "Ainda não houve deploy: o .env vale no primeiro deploy do CD."
  fi
fi
EOF
