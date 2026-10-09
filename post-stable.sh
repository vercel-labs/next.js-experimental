#!/bin/bash
# Simulates a no-JS (progressive enhancement) submission of the form rendered at $URL:
# scrape the server-rendered $ACTION_* hidden fields and POST them back as multipart/form-data.
set -u
URL=${1:-http://localhost:3000/stable}
ARGS=$(curl -s --max-time 60 "$URL" | python3 -c '
import sys, re, html, shlex
page = sys.stdin.read()
form = re.search(r"<form[^>]*>.*?</form>", page, re.S)
assert form, "no <form> rendered"
out = []
for name, value in re.findall(r"<input[^>]*name=\"(\$[^\"]*)\"[^>]*?(?:value=\"([^\"]*)\")?/?>", form.group(0)):
    out.append("-F")
    out.append(shlex.quote(name + "=" + html.unescape(value or "")))
print(" ".join(out))
')
echo "fields: $ARGS"
eval curl -s -S -i --max-time 60 -X POST "$URL" -H "'Origin: ${URL%/*}'" $ARGS -F "name=world"
