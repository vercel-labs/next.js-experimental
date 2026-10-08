# Repro: Turbopack static AVIF import for next/image

next 16.4.0, App Router, `next dev` (Turbopack default).

```
npm install
npm run dev
# open http://localhost:3000
```

`app/sample.avif` is a real 640x360 AVIF file. Expected: the static import exposes
width 640 / height 360. Observed: Turbopack emits the issue
"AVIF image not supported - This version of Turbopack does not support AVIF images,
will emit without optimization or encoding" and the static import metadata falls back
to 100x100, so `next/image` renders the image with wrong intrinsic dimensions.
The identical PNG (`app/sample.png`) reports the correct 640x360.
