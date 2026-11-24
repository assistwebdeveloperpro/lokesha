"use client";

import "leaflet/dist/leaflet.css";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";
import { buildGoogleMapsUrl } from "@/lib/mapLinks";
import {
  MAP_MARKER_HTML,
  MAP_MARKER_SIZE,
  OSM_ATTRIBUTION,
  OSM_MAX_ZOOM,
  OSM_TILE_URL,
} from "@/lib/openStreetMap";

const MAP_ZOOM = 16;

type PropertyDetailsMapProps = {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
};

export function PropertyDetailsMap({ title, address, latitude, longitude }: PropertyDetailsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let removeMap = () => {};

    (async () => {
      const L = await import("leaflet");
      if (disposed || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: MAP_ZOOM,
        scrollWheelZoom: false,
      });
      L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: OSM_MAX_ZOOM }).addTo(map);
      L.marker([latitude, longitude], {
        title,
        icon: L.divIcon({
          html: MAP_MARKER_HTML,
          className: "",
          iconSize: [MAP_MARKER_SIZE, MAP_MARKER_SIZE],
          iconAnchor: [MAP_MARKER_SIZE / 2, MAP_MARKER_SIZE],
        }),
      }).addTo(map);

      removeMap = () => map.remove();
    })();

    return () => {
      disposed = true;
      removeMap();
    };
  }, [latitude, longitude, title]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div ref={containerRef} className="z-0 h-42 w-full sm:h-46 md:h-66" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-xs text-slate-600 sm:text-sm">{address}</p>
        <a
          href={buildGoogleMapsUrl(latitude, longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-600 px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 sm:text-sm"
        >
          Open in Google Maps
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
