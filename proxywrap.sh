#!/bin/bash
# socat PROXY wrapper for git SSH via the egress proxy. Args: %h %p
HP=$(echo "$https_proxy" | sed -E 's|^https?://([^@]*@)?([^:/]+):([0-9]+).*|\2:\3|')
PHOST=${HP%:*}
PPORT=${HP##*:}
exec socat - "PROXY:${PHOST}:$1:$2,proxyport=${PPORT}"
