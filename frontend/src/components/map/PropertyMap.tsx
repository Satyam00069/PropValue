"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { formatINR } from "@/lib/utils";

interface PropertyMapProps {
  properties: any[];
  transactions: any[];
  businesses: any[];
  localities: any[];
  activeLayer: "properties" | "sold" | "businesses" | "all";
  onSelectProperty?: (prop: any) => void;
  onSelectLocality?: (loc: any) => void;
  selectedLocalityCoords?: [number, number] | null;
  radiusKm?: number;
}

// Generate GeoJSON Polygon coordinates for a circular radius buffer
function createGeoJSONCircle(center: [number, number], radiusInKm: number, points: number = 64) {
  const coords = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
    properties: {},
  };
}

export default function PropertyMap({
  properties,
  transactions,
  businesses,
  localities,
  activeLayer,
  onSelectProperty,
  onSelectLocality,
  selectedLocalityCoords,
  radiusKm = 3,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [73.8567, 18.5204], // Pune Center
      zoom: 11.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      // Add empty source for radius circle
      map.current?.addSource("radius-circle", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.current?.addLayer({
        id: "radius-circle-fill",
        type: "fill",
        source: "radius-circle",
        paint: {
          "fill-color": "#0284c7",
          "fill-opacity": 0.12,
        },
      });

      map.current?.addLayer({
        id: "radius-circle-stroke",
        type: "line",
        source: "radius-circle",
        paint: {
          "line-color": "#0284c7",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update center & radius circle when locality or radius changes
  useEffect(() => {
    if (!map.current) return;

    if (selectedLocalityCoords) {
      map.current.flyTo({
        center: selectedLocalityCoords,
        zoom: radiusKm > 4 ? 12 : 13.5,
        essential: true,
      });

      // Update GeoJSON circle
      const circleData = createGeoJSONCircle(selectedLocalityCoords, radiusKm);
      const source = map.current.getSource("radius-circle") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [circleData as any],
        });
      }
    } else {
      const source = map.current.getSource("radius-circle") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
    }
  }, [selectedLocalityCoords, radiusKm]);

  // Update Markers when layer or data changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. Add Property Markers
    if (activeLayer === "properties" || activeLayer === "all") {
      properties.forEach((p) => {
        const el = document.createElement("div");
        el.className = "property-map-pin";
        el.innerHTML = `
          <div style="background-color: #0284c7; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>${p.asking_price ? formatINR(p.asking_price) : "Listing"}</span>
          </div>
        `;

        el.addEventListener("click", () => {
          if (onSelectProperty) onSelectProperty(p);
        });

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 200px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${p.title}</div>
            <div style="color: #64748b; margin-bottom: 6px;">${p.locality_name || "Pune"} • ${p.carpet_area_sqft} sqft</div>
            <div style="font-size: 14px; font-weight: 800; color: #0284c7;">${formatINR(p.asking_price)}</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">${p.fair_price_status || "Fairly priced"}</div>
            <a href="/properties/${p.id}" style="display: block; margin-top: 6px; color: #0284c7; font-weight: 600; text-decoration: underline;">View Details &rarr;</a>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.longitude, p.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }

    // 2. Add Recently Sold Markers
    if (activeLayer === "sold" || activeLayer === "all") {
      transactions.forEach((tx) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="background-color: #059669; color: white; padding: 3px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1.5px solid white; cursor: pointer;">
            <span>SOLD ${formatINR(tx.transacted_price)}</span>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 220px;">
            <div style="color: #059669; font-weight: bold; font-size: 11px; text-transform: uppercase;">Verified Registered Deed</div>
            <div style="font-weight: bold; font-size: 13px; margin: 2px 0;">${tx.unit_type || "Apartment"} in ${tx.locality_name || "Pune"}</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${formatINR(tx.transacted_price)}</div>
            <div style="color: #64748b; font-size: 11px;">₹${tx.price_per_sqft.toLocaleString()}/sqft • ${tx.transaction_date}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">Source: ${tx.data_source}</div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([tx.longitude, tx.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }

    // 3. Add Business Markers
    if (activeLayer === "businesses" || activeLayer === "all") {
      businesses.forEach((b) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="background-color: #6366f1; color: white; width: 22px; height: 22px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid white; cursor: pointer;" title="${b.name}">
            💼
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <div style="font-weight: bold; color: #1e1b4b;">${b.name}</div>
            <div style="color: #64748b; text-transform: capitalize;">${b.category.replace('_', ' ')} • ${b.status}</div>
            <div style="font-size: 10px; color: #6366f1; margin-top: 3px;">Status: ${b.verification_status.replace('_', ' ')}</div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([b.longitude, b.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }

    // 4. Locality Centroid Labels
    localities.forEach((loc) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="background-color: rgba(15, 23, 42, 0.85); color: #f8fafc; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(2px);">
          📍 ${loc.name}
        </div>
      `;

      el.addEventListener("click", () => {
        if (onSelectLocality) onSelectLocality(loc);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

  }, [properties, transactions, businesses, localities, activeLayer, onSelectProperty, onSelectLocality]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-inner" />
    </div>
  );
}
