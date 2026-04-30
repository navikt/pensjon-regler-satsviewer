#!/bin/sh
set -e

if [ -z "$GITHUB_APP_PRIVATE_KEY" ]; then
  echo "WARNING: GITHUB_APP_PRIVATE_KEY is empty - starting without GitHub token"
  exec nginx -g 'daemon off;'
fi

# NAIS VAR-format er kommaseparert, så flerlinjers PEM-nøkler må base64-encodes først
echo "$GITHUB_APP_PRIVATE_KEY" | base64 -d > /tmp/github-app-key.pem
chmod 600 /tmp/github-app-key.pem

# Generer JWT for GitHub App-autentisering
generate_jwt() {
  NOW=$(date +%s)
  IAT=$((NOW - 60))
  EXP=$((NOW + 600))

  HEADER=$(printf '{"alg":"RS256","typ":"JWT"}' | openssl base64 -e | tr -d '=\n' | tr '/+' '_-')
  PAYLOAD=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$IAT" "$EXP" "$GITHUB_APP_ID" | openssl base64 -e | tr -d '=\n' | tr '/+' '_-')
  SIGNATURE=$(printf '%s.%s' "$HEADER" "$PAYLOAD" | openssl dgst -sha256 -sign /tmp/github-app-key.pem -binary | openssl base64 -e | tr -d '=\n' | tr '/+' '_-')

  printf '%s.%s.%s' "$HEADER" "$PAYLOAD" "$SIGNATURE"
}

# Bytt JWT mot en installation access token
get_installation_token() {
  JWT=$(generate_jwt)

  RESPONSE=$(curl -s -H "Authorization: Bearer $JWT" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/app/installations)

  INSTALLATION_ID=$(echo "$RESPONSE" | sed -n 's/.*"id": *\([0-9]*\).*/\1/p' | head -1)

  if [ -z "$INSTALLATION_ID" ]; then
    echo "ERROR: Could not get installation ID" >&2
    return 1
  fi

  TOKEN=$(curl -sf -X POST -H "Authorization: Bearer $JWT" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/app/installations/$INSTALLATION_ID/access_tokens" | sed -n 's/.*"token": *"\([^"]*\)".*/\1/p')

  if [ -z "$TOKEN" ]; then
    echo "ERROR: Could not get installation token" >&2
    return 1
  fi

  echo "$TOKEN"
}

# Sett token inn i nginx-konfig
TOKEN=$(get_installation_token)
if [ -n "$TOKEN" ]; then
  sed -i "s|GITHUB_APP_TOKEN_PLACEHOLDER|${TOKEN}|g" /etc/nginx/conf.d/default.conf
  echo "GitHub App token injected successfully"
else
  echo "WARNING: Failed to get GitHub token, history page will not work"
fi

# GitHub App installation tokens utløper etter 1 time — refresh hver 50. minutt
(
  while true; do
    sleep 3000
    NEW_TOKEN=$(get_installation_token) || continue
    sed -i "s|token [^ \"]*|token ${NEW_TOKEN}|g" /etc/nginx/conf.d/default.conf
    nginx -s reload 2>/dev/null || true
  done
) &

# Start nginx
exec nginx -g 'daemon off;'
