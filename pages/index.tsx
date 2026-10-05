"use client";

import dynamic from "next/dynamic";

const Map = dynamic(
  () =>
    import("./map").then((mod) => mod.Map),
  { ssr: false },
);

/** Add your relevant code here for the issue to reproduce */
export default function Home() {
  return (
    <>
      <h1>Maplibre-GL bug report</h1>
      <Map />
    </>
  );
}
