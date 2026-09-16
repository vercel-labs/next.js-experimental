#!/usr/bin/env bash
PORT=${PORT:-3100}
for path in /ppr /static-cached; do
  for ua in "Mozilla/5.0 (Macintosh) Chrome/131 Safari/537.36" \
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
            "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)" \
            "Mozilla/5.0 (compatible; YandexBot/3.0)"; do
    echo "### $path | $ua"
    curl -s -D - -o /dev/null -H "user-agent: $ua" "http://localhost:$PORT$path" \
      | grep -iE 'HTTP/|x-nextjs|^cache-control'
  done
done
