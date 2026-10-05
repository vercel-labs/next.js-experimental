"use client";

import { setWorkerUrl } from "maplibre-gl";
import TileLayer from "ol/layer/Tile";
import OpenLayersMap from "ol/Map";
import { OSM } from "ol/source";
import { useEffect, useMemo, useRef } from "react";
import { Collection } from "ol";
import { MapLibreLayer } from "@geoblocks/ol-maplibre-layer";
import View from "ol/View";
import BaseLayer from "ol/layer/Base";
// import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

const workerUrl = new URL(
  "maplibre-gl/dist/maplibre-gl-worker.mjs",
  import.meta.url,
).toString();
console.info(workerUrl);
setWorkerUrl(workerUrl);

const useLayer = (map: OpenLayersMap, layer: BaseLayer) => {
  useEffect(() => {
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer]);
};

export const Map = () => {
  const map = useMemo(
    () => new OpenLayersMap({ view: new View({ center: [0, 0], zoom: 2 }) }),
    [],
  );

  const domRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(domRef.current!), [map]);

  const osm = useMemo(
    () => new TileLayer({ source: new OSM({ crossOrigin: "anonymous" }) }),
    [],
  );
  const maplibre = useMemo(
    () =>
      new MapLibreLayer({
        mapLibreOptions: {
          style: "https://demotiles.maplibre.org/style.json"
        },
      }),
    [],
  );
  useLayer(map, osm);
  useLayer(map, maplibre);

  return (
    <div style={{ width: "500px", height: "500px" }}>
      <div ref={domRef} style={{ width: "500px", height: "500px" }}></div>
    </div>
  );
};
