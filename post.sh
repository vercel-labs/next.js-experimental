#!/bin/bash
# Simulates a no-JS form submission (progressive enhancement) of the rendered form.
URL=${1:-http://localhost:3000/permalink}
curl -s -S -i --max-time 60 -X POST "$URL" \
  -H 'Origin: http://localhost:3000' \
  -F '$ACTION_REF_1=' \
  -F '$ACTION_1:0={"id":"703ff5d45ab9b8235935a93abbdcfde34b2771658c","bound":"$@1"}' \
  -F '$ACTION_1:1=["bound-value",null]' \
  -F '$ACTION_KEY=p/permalink' \
  -F 'name=world'
