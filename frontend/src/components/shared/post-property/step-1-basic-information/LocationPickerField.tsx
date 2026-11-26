"use client";

import "leaflet/dist/leaflet.css";
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MAP_MARKER_HTML,
  MAP_MARKER_SIZE,
  OSM_ATTRIBUTION,
  OSM_MAX_ZOOM,
  OSM_TILE_URL,
  searchPlaces,
  type PlaceResult,
} from "@/lib/openStreetMap";
import { usePostPropertyReadOnly } from "../config/postPropertyReadOnly";

const INDIA_CENTER: [number, number] = [22.9734, 78.6569];
const INDIA_ZOOM = 5;
const PIN_ZOOM = 17;
const SEARCH_DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;
const COORDINATE_DECIMALS = 6;

type LocationPickerFieldProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number | null, longitude: number | null) => void;
};

const round = (value: number) => Number(value.toFixed(COORDINATE_DECIMALS));

export default function LocationPickerField({ latitude, longitude, onChange }: LocationPickerFieldProps) {
  const readOnly = usePostPropertyReadOnly();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const placeMarkerRef = useRef<(lat: number, lng: number) => void>(() => {});
  const onChangeRef = useRef(onChange);
  const readOnlyRef = useRef(readOnly);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
    readOnlyRef.current = readOnly;
  });

  useEffect(() => {
    let disposed = false;

    (async () => {
      const L = await import("leaflet");
      if (disposed || !containerRef.current || mapRef.current) return;

      const hasPin = latitude !== null && longitude !== null;
      const map = L.map(containerRef.current, {
        center: hasPin ? [latitude, longitude] : INDIA_CENTER,
        zoom: hasPin ? PIN_ZOOM : INDIA_ZOOM,
        scrollWheelZoom: false,
      });
      L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: OSM_MAX_ZOOM }).addTo(map);

      const icon = L.divIcon({
        html: MAP_MARKER_HTML,
        className: "",
        iconSize: [MAP_MARKER_SIZE, MAP_MARKER_SIZE],
        iconAnchor: [MAP_MARKER_SIZE / 2, MAP_MARKER_SIZE],
      });

      const placeMarker = (lat: number, lng: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          if (!map.hasLayer(markerRef.current)) markerRef.current.addTo(map);
          return;
        }
        const marker = L.marker([lat, lng], { icon, draggable: !readOnlyRef.current }).addTo(map);
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          onChangeRef.current(round(position.lat), round(position.lng));
        });
        markerRef.current = marker;
      };

      placeMarkerRef.current = placeMarker;
      if (hasPin) placeMarker(latitude, longitude);

      map.on("click", (event: LeafletMouseEvent) => {
        if (readOnlyRef.current) return;
        placeMarker(event.latlng.lat, event.latlng.lng);
        onChangeRef.current(round(event.latlng.lat), round(event.latlng.lng));
      });

      mapRef.current = map;
    })();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once; later coordinate changes are synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (latitude === null || longitude === null) {
      markerRef.current?.remove();
      return;
    }
    placeMarkerRef.current(latitude, longitude);
  }, [latitude, longitude]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setMessage("");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setMessage("");
      try {
        const found = await searchPlaces(term, controller.signal);
        setResults(found);
        if (!found.length) setMessage("No matching location found");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setMessage("Unable to search right now");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const selectResult = (result: PlaceResult) => {
    const map = mapRef.current;
    if (!map) return;

    placeMarkerRef.current(result.latitude, result.longitude);
    map.flyTo([result.latitude, result.longitude], PIN_ZOOM);
    onChange(round(result.latitude), round(result.longitude));
    setQuery("");
    setResults([]);
  };

  const hasPin = latitude !== null && longitude !== null;

  return (
    <div className="space-y-3">
      {readOnly ? null : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            placeholder="Search society, area, landmark or address"
            aria-label="Search location on map"
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-0 border-b border-slate-300 bg-transparent py-2.5 pl-6 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300"
          />
          {searching ? (
            <LoaderCircle
              className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-sky-600"
              aria-hidden
            />
          ) : null}

          {results.length > 0 ? (
            <ul className="absolute z-1000 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => selectResult(result)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-sky-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                    <span className="line-clamp-2">{result.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {message ? <p className="mt-1 text-sm text-slate-500">{message}</p> : null}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <div ref={containerRef} className="z-0 h-64 w-full sm:h-72 md:h-80" />
      </div>

      <div className="flex min-h-5 flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {hasPin
            ? "Location pinned. Drag the marker to adjust."
            : "Search above or click on the map to pin the exact property location."}
        </span>
        {!readOnly && hasPin ? (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Remove pin
          </button>
        ) : null}
      </div>
    </div>
  );
}
