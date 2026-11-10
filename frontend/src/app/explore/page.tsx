"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Layers,
  MapPin,
  Building2,
  Filter,
  Eye,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { Property, PropertyTransaction, Locality, Business } from "@/types";
import { formatINR } from "@/lib/utils";

// Dynamic import for MapLibre container to avoid SSR canvas mismatch
const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400">
      Loading Interactive Map...
    </div>
  ),
});

export default function ExploreMapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [activeLayer, setActiveLayer] = useState<"properties" | "sold" | "businesses" | "all">("all");
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedLocalityData, setSelectedLocalityData] = useState<Locality | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [viewMode, setViewMode] = useState<"split" | "map">("split");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true);
        const [props, txs, bizs, locs] = await Promise.all([
          api.getProperties({ locality: selectedLocality || undefined }),
          api.getTransactions({ locality: selectedLocality || undefined }),
          api.getBusinesses({ locality: selectedLocality || undefined }),
          api.getNeighbourhoods()
        ]);
        setProperties(props);
        setTransactions(txs);
        setBusinesses(bizs);
        setLocalities(locs);
      } catch (err) {
        console.error("Failed to load map data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, [selectedLocality]);

  const handleSelectLocality = (loc: Locality) => {
    setSelectedLocalityData(loc);
    setSelectedLocality(loc.slug);
  };

  const selectedLocalityCoords: [number, number] | null = selectedLocalityData
    ? [selectedLocalityData.longitude, selectedLocalityData.latitude]
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden bg-slate-50">
      {/* Top Map Control Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Map Layers:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveLayer("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLayer === "all" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setActiveLayer("properties")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLayer === "properties" ? "bg-sky-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active Listings ({properties.length})
            </button>
            <button
              onClick={() => setActiveLayer("sold")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLayer === "sold" ? "bg-emerald-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Recently Sold ({transactions.length})
            </button>
            <button
              onClick={() => setActiveLayer("businesses")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLayer === "businesses" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Businesses ({businesses.length})
            </button>
          </div>
        </div>

        {/* Locality Filter dropdown & Split toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLocality}
              onChange={(e) => {
                setSelectedLocality(e.target.value);
                const found = localities.find((l) => l.slug === e.target.value);
                if (found) setSelectedLocalityData(found);
                else setSelectedLocalityData(null);
              }}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="">All Pune Micro-Markets</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.slug}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Filter */}
          {selectedLocality && (
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-2 py-1 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500">Radius:</span>
              {[1, 3, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    radiusKm === r ? "bg-sky-600 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded ${viewMode === "split" ? "bg-slate-900 text-white font-semibold" : "text-slate-600"}`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-2.5 py-1 rounded ${viewMode === "map" ? "bg-slate-900 text-white font-semibold" : "text-slate-600"}`}
            >
              Full Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace (Map + Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Interactive Map Canvas */}
        <div className="flex-1 h-full p-3">
          <PropertyMap
            properties={properties}
            transactions={transactions}
            businesses={businesses}
            localities={localities}
            activeLayer={activeLayer}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onSelectLocality={handleSelectLocality}
            selectedLocalityCoords={selectedLocalityCoords}
            radiusKm={radiusKm}
          />
        </div>

        {/* Split View Sidebar */}
        {viewMode === "split" && (
          <div className="w-96 border-l border-slate-200 bg-white h-full overflow-y-auto flex flex-col p-4 z-10 shadow-lg">
            {/* Selected Property Preview or Active Locality Info */}
            {selectedProperty ? (
              <div className="bg-slate-50 border border-sky-200 rounded-xl p-4 mb-4 relative">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Selected Property Preview</span>
                <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-2">{selectedProperty.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{selectedProperty.locality_name} • {selectedProperty.carpet_area_sqft} sq.ft.</p>
                <div className="text-xl font-extrabold text-slate-900 mb-1">
                  {formatINR(selectedProperty.asking_price)}
                </div>
                <div className="text-xs text-slate-600 mb-3">
                  ₹{selectedProperty.price_per_sqft?.toLocaleString()}/sqft
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedProperty.fair_price_status === "Undervalued"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-sky-100 text-sky-800"
                  }`}>
                    {selectedProperty.fair_price_status || "Fairly priced"}
                  </span>
                  <span className="text-[11px] text-slate-500">Verified Listing</span>
                </div>
                <Link
                  href={`/properties/${selectedProperty.id}`}
                  className="block w-full text-center py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                >
                  Open Full Valuation &amp; Specs
                </Link>
              </div>
            ) : selectedLocalityData ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Locality Benchmark</span>
                <h3 className="font-bold text-slate-900 text-lg">{selectedLocalityData.name}</h3>
                <p className="text-xs text-slate-600 mt-1 mb-3">{selectedLocalityData.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px]">Avg Price/sqft</span>
                    <span className="block font-bold text-slate-800">₹{selectedLocalityData.avg_transacted_price_sqft.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Gross Yield</span>
                    <span className="block font-bold text-emerald-600">{selectedLocalityData.rental_yield_pct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Livability Score</span>
                    <span className="block font-bold text-slate-800">{selectedLocalityData.livability_score} / 10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Commercial Score</span>
                    <span className="block font-bold text-slate-800">{selectedLocalityData.commercial_score} / 10</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* List of properties matching the map view */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Matching Listings ({properties.length})
              </h4>
              <span className="text-[11px] text-slate-500">Pune Market</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {properties.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProperty(p)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedProperty?.id === p.id
                      ? "border-sky-500 bg-sky-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{p.title}</h5>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded flex-shrink-0">
                      {p.fair_price_status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{p.locality_name} • {p.carpet_area_sqft} sqft</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{formatINR(p.asking_price)}</span>
                    <span className="text-[11px] text-slate-400">₹{p.price_per_sqft?.toLocaleString()}/sqft</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

