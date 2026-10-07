# Repro: `revalidateTag` after returning a streaming Response is not applied

Next.js 16.4.0, Turbopack, `cacheComponents: true`, production server.

## Run

```bash
npm install
rm -f /tmp/repro-db.txt
npm run build
npm start

# 1. warm the cached page
curl -s localhost:3000/ | grep -o '<p id="value">[^<]*'        # initial

# 2. streaming route handler: returns the SSE Response first, then mutates
#    and calls revalidateTag('data', { expire: 0 }) inside the stream
curl -sN "localhost:3000/api/stream-mutate?value=streamed"

# 3. request the page again -> STILL STALE ("initial")
curl -s localhost:3000/ | grep -o '<p id="value">[^<]*'

# 4. control: mutation + revalidateTag complete before the Response returns
curl -s "localhost:3000/api/sync-mutate?value=sync"
curl -s localhost:3000/ | grep -o '<p id="value">[^<]*'        # sync  (works)
```

## Observed

Step 3 serves the pre-mutation value. `revalidateTag` inside the stream neither
throws nor logs a warning (the `revalidated` SSE event is emitted), so the
invalidation is silently dropped. The control route in step 4 invalidates
correctly.
