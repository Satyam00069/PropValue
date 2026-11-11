"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  TrendingUp,
  Briefcase,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Compass
} from "lucide-react";
import { api } from "@/lib/api";
import { PUNE_LOCALITIES } from "@/lib/puneData";
import { Locality } from "@/types";

export default function NeighbourhoodsPage() {
  const [localities, setLocalities] = useState<Locality[]>(PUNE_LOCALITIES);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getNeighbourhoods();
        setLocalities(data);
      } catch (err) {
        console.error("Failed to load neighbourhoods:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredLocalities = localities.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.pincode?.includes(searchQuery) ||
    loc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Neighbourhood Intelligence</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Pune Coverage (15 Micro-Markets)</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pune Neighbourhood Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Locality-level livability metrics, infrastructure connectivity, business density, and real estate pricing benchmarks.
            </p>
          </div>
          {/* Locality Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search locality (e.g. Baner, Wakad)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid of 15 Pune Localities */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocalities.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                      {loc.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Pune, Maharashtra • PIN: {loc.pincode}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-extrabold">
                      {loc.livability_score} / 10
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Livability</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {loc.description}
                </p>

                {/* Score Pills */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Connectivity</span>
                    <span className="font-bold text-slate-800 text-xs">{loc.connectivity_score}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Amenities</span>
                    <span className="font-bold text-slate-800 text-xs">{loc.amenity_score}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Commercial</span>
                    <span className="font-bold text-slate-800 text-xs">{loc.commercial_score}</span>
                  </div>
                </div>

                {/* Rates & Rental Yield */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Transacted Rate</span>
                    <span className="font-extrabold text-slate-900">₹{loc.avg_transacted_price_sqft.toLocaleString()} / sqft</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rental Yield</span>
                    <span className="font-extrabold text-emerald-600">{loc.rental_yield_pct}% gross</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/neighbourhoods/${loc.slug}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs transition-colors"
                >
                  Locality Profile &rarr;
                </Link>
                <Link
                  href={`/explore`}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  title="View on Interactive Map"
                >
                  <Compass className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

