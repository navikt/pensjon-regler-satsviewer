#!/bin/sh
set -e

APP_ID="${GITHUB_APP_ID}"
PEM_PATH="/tmp/github-app-key.pem"

log() {
  echo "[$(date '+%H:%M:%S')] $1"
}

if [ -z "$GITHUB_APP_PRIVATE_KEY" ]; then
  log "WARNING: GITHUB_APP_PRIVATE_KEY mangler — starter uten GitHub-token"
  exec nginx -g 'daemon off;'
fi

if [ -z "$APP_ID" ]; then
  log "WARNING: GITHUB_APP_ID mangler — starter uten GitHub-token"
  exec nginx -g 'daemon off;'
fi

# Dekod PEM-nøkkel (base64-kodet pga NAIS VAR-format som er kommaseparert)
echo "$GITHUB_APP_PRIVATE_KEY" | base64 -d > "$PEM_PATH"
chmod 600 "$PEM_PATH"

# Generer JWT (RS256) for GitHub App
generate_jwt() {
  NOW=$(date +%s)
  IAT=$((NOW - 60))
  EXP=$((NOW + 600))

  HEADER=$(printf '{"alg":"RS256","typ":"JWT"}' | openssl base64 -e | tr -d '=\n' | tr '/+' '_-')
  PAYLOAD=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$IAT" "$EXP" "$APP_ID" | openssl base64 -e | tr -d '=\n' | tr '/+' '_-')
  SIGNATURE=$(printf '%s.%s' "$HEADER" "$PAYLOAD" | openssl dgst -sha256 -sign "$PEM_PATH" -binary | openssl base64 -e | tr -d '=\n' | tr '/+' '_-')

  printf '%s.%s.%s' "$HEADER" "$PAYLOAD" "$SIGNATURE"
}

# Hent installation ID og bytt JWT mot access token
get_token() {
  JWT=$(generate_jwt)

  INSTALLATION_ID=$(curl -sf \
    -H "Authorization: Bearer $JWT" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/app/installations \
    | sed -n 's/.*"id": *\([0-9]*\).*/\1/p' | head -1)

  if [ -z "$INSTALLATION_ID" ]; then
    log "ERROR: Klarte ikke hente installation ID"
    return 1
  fi

  TOKEN=$(curl -sf -X POST \
    -H "Authorization: Bearer $JWT" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/app/installations/$INSTALLATION_ID/access_tokens" \
    | sed -n 's/.*"token": *"\([^"]*\)".*/\1/p')

  if [ -z "$TOKEN" ]; then
    log "ERROR: Fikk ikke token fra GitHub"
    return 1
  fi

  echo "$TOKEN"
}

# Injiser token i nginx-konfig
inject_token() {
  TOKEN=$(get_token) || return 1
  sed -i "s|token [^\"]*\"|token ${TOKEN}\"|" /etc/nginx/conf.d/default.conf
  echo "$TOKEN"
}

# Første token-henting
TOKEN=$(inject_token)
if [ -n "$TOKEN" ]; then
  log "GitHub App token injisert OK"
else
  log "WARNING: Klarte ikke hente token — historikk-siden vil ikke fungere"
fi

# Token utløper etter 1 time — refresh hvert 50. minutt
(
  while true; do
    sleep 3000
    if inject_token > /dev/null; then
      nginx -s reload 2>/dev/null || true
      log "Token refreshet OK"
    else
      log "WARNING: Token-refresh feilet, prøver igjen om 50 min"
    fi
  done
) &

exec nginx -g 'daemon off;'
