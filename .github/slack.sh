#!/usr/bin/env bash

USER=$1
PAYLOAD=$2
WEBHOOK_URL=$3

function notify() {
  tempfolder=$(mktemp -d)
  cd "${tempfolder}"

  declare -A users
  users[jSchiefloe]=UAYM4QZC7
  users[ehellerslien]=UAXMXU56U
  users[ttnesby]=U6TMQ5QE9
  users[tordbjorn77]=U02S9K2C1F0
  users[Jonashla]=U0465EPQ1C6
  users[JoakimEJacobsen]=UAM0N4T7G

  for key in "${!users[@]}"; do
    if [ $key == "${USER}" ]; then
      slack_id="<@${users[$key]}>"
      break
    else
      slack_id=$USER
    fi
  done

  export slack_id

  PAYLOAD=$(echo "$PAYLOAD" | envsubst)
  curl -X POST --data-urlencode "${PAYLOAD}" $WEBHOOK_URL
}

(notify)