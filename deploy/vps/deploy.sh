#!/usr/bin/env bash
# Deploy na VPS. Uso (na pasta do projeto na VPS): bash deploy.sh <versão> [docker-hub-user]   ex.: bash deploy.sh 1.0.6
#
# O .env vem de deploy/vps/.env (local) via `npm run deploy:env -- usuario@host` e nunca é sobrescrito aqui;
# o script só grava nele APP_VERSION e, se informado, DOCKER_HUB_USERNAME.
#
# 1. valida a versão, o .env e o compose novo (docker-compose.yml.new, enviado pelo CD);
# 2. baixa as imagens da versão ANTES de mexer em qualquer coisa (se falhar, nada muda);
# 3. faz backup do banco (pg_dump) — as migrations rodam quando a API sobe;
# 4. grava APP_VERSION no .env e sobe com `docker compose up -d --wait`.
# Nunca usa `down` nem `-v`: o volume do banco (store-postgres-data) não é tocado.
set -euo pipefail

VERSION="${1:-}"
IMAGE_USER="${2:-}"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Uso: bash deploy.sh <X.Y.Z> (recebido: '${VERSION}')" >&2; exit 2; }
cd "$(dirname "$(readlink -f "$0")")"

KEEP_BACKUPS=10
log() { printf '\n==> %s\n' "$*"; }
# Grava/atualiza VAR='valor' no .env sem tocar no resto.
set_env() {
  local tmp
  tmp="$(mktemp .env.XXXXXX)"
  grep -v "^$1=" .env > "$tmp" || true
  printf "%s='%s'\n" "$1" "$2" >> "$tmp"
  chmod 600 "$tmp"
  mv "$tmp" .env
}

# --- 1. validações -----------------------------------------------------------------------------------------------
[ -f .env ] || { echo "Falta o .env em $(pwd). Na sua máquina: npm run deploy:env -- usuario@host" >&2; exit 1; }
if [ -n "$IMAGE_USER" ]; then
  [[ "$IMAGE_USER" =~ ^[a-z0-9._-]+$ ]] || { echo "Usuário do Docker Hub inválido: '${IMAGE_USER}'" >&2; exit 2; }
  set_env DOCKER_HUB_USERNAME "$IMAGE_USER"
fi
missing=""
for var in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB DOCKER_HUB_USERNAME AUTH_SECRET ADMIN_EMAIL ADMIN_PASSWORD PUBLIC_ORIGIN; do
  # Exige valor não vazio (aceita com ou sem aspas).
  grep -qE "^${var}=['\"]?[^'\"[:space:]]" .env || missing="$missing $var"
done
[ -z "$missing" ] || { echo "Variáveis obrigatórias vazias ou ausentes no .env:$missing" >&2; exit 1; }

if [ -f docker-compose.yml.new ]; then
  log "Validando o docker-compose.yml novo"
  APP_VERSION="$VERSION" docker compose -f docker-compose.yml.new config -q
  if [ -f docker-compose.yml ] && ! cmp -s docker-compose.yml docker-compose.yml.new; then
    cp docker-compose.yml "docker-compose.yml.bak"
    echo "compose anterior salvo em docker-compose.yml.bak"
  fi
  mv docker-compose.yml.new docker-compose.yml
fi
[ -f docker-compose.yml ] || { echo "docker-compose.yml não encontrado" >&2; exit 1; }

# --- 2. imagens --------------------------------------------------------------------------------------------------
log "Baixando as imagens ${VERSION}"
APP_VERSION="$VERSION" docker compose pull api web

# --- 3. backup do banco ------------------------------------------------------------------------------------------
if [ "$(docker inspect -f '{{.State.Running}}' store-postgres 2>/dev/null || true)" = "true" ]; then
  mkdir -p backups
  backup="backups/store-$(date -u +%Y%m%dT%H%M%SZ)-antes-de-${VERSION}.sql.gz"
  log "Backup do banco em ${backup}"
  # Variáveis expandidas DENTRO do container (aspas simples): a senha não passa pela linha de comando do host.
  docker exec store-postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' | gzip > "$backup"
  chmod 600 "$backup"
  # Mantém só os últimos KEEP_BACKUPS (nomes gerados acima, sem espaços).
  # shellcheck disable=SC2012
  ls -1t backups/store-*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm --
else
  log "Postgres não está rodando: backup pulado (primeiro deploy?)"
fi

# --- 4. sobe a versão nova ---------------------------------------------------------------------------------------
set_env APP_VERSION "$VERSION"

log "Subindo ${VERSION} (recria só o que mudou; o banco e o volume ficam como estão)"
if ! docker compose up -d --wait --wait-timeout 300; then
  echo "Deploy falhou: containers não ficaram saudáveis." >&2
  docker compose ps >&2 || true
  docker compose logs --tail 80 api web >&2 || true
  exit 1
fi

docker compose ps

# Remove só imagens antigas DESTE projeto (outros projetos da VPS não são tocados); imagens em uso não são removidas.
IMAGE_NS="$(grep -E '^DOCKER_HUB_USERNAME=' .env | head -1 | cut -d= -f2- | tr -d "'\"")"
docker images --format '{{.Repository}}:{{.Tag}}' \
  | grep -E "^${IMAGE_NS}/store-(api|web):" \
  | grep -vE ":(${VERSION//./\\.}|latest)$" \
  | xargs -r docker rmi >/dev/null 2>&1 || true
docker compose -f /root/projects/infra/docker-compose.yml restart nginx \
  || echo "AVISO: não foi possível reiniciar o nginx (/root/projects/infra/docker-compose.yml)" >&2
log "Deploy ${VERSION} concluído"