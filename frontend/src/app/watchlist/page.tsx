"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Building2,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";
import { Property } from "@/types";
import { formatINR } from "@/lib/utils";

export default function WatchlistPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setLoading(true);
        // Load initial verified properties as saved items
        const props = await api.getProperties({ limit: 3 });
        setProperties(props);
      } catch (err) {
        console.error("Failed to load watchlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlist();
  }, []);

  const handleRemove = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">User Workspace</span>
          <span>/</span>
          <span className="text-amber-600 font-medium">Saved Properties</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Property Watchlist
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {properties.length} Properties
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track asking price modifications, AI valuation recalibrations, and market dynamics on saved properties.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Browse verified listings in Pune and bookmark properties to track price changes and fair value updates.
          </p>
          <Link
            href="/properties"
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
          >
            Browse Properties for Sale
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100">
                  {p.primary_image ? (
                    <img src={p.primary_image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
                    {p.locality_name}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">{p.title}</h3>
                  <div className="text-xs text-slate-500 mb-3">{p.bedrooms} BHK • {p.carpet_area_sqft} sqft</div>

                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Asking Price</span>
                      <span className="font-extrabold text-slate-900 text-sm">{formatINR(p.asking_price)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">AI Market Value</span>
                      <span className="font-bold text-sky-700 text-sm">{formatINR(p.estimated_value)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  href={`/properties/${p.id}`}
                  className="block w-full text-center py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold transition-colors"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

