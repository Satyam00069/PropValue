"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Filter,
  Search,
  SlidersHorizontal,
  Bookmark,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowUpDown
} from "lucide-react";
import { api } from "@/lib/api";
import { Property, Locality } from "@/types";
import { formatINR } from "@/lib/utils";

export default function BuyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [fairPriceStatus, setFairPriceStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [loading, setLoading] = useState<boolean>(true);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [props, locs] = await Promise.all([
          api.getProperties({
            locality: selectedLocality || undefined,
            property_type: propertyType || undefined,
            bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
            fair_price_status: fairPriceStatus || undefined,
            sort_by: sortBy
          }),
          api.getNeighbourhoods()
        ]);
        setProperties(props);
        setLocalities(locs);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLocality, propertyType, bedrooms, fairPriceStatus, sortBy]);

  const toggleSave = (id: string) => {
    const next = new Set(savedPropertyIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedPropertyIds(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Buy Properties</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Pune, Maharashtra</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Properties for Sale in Pune
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {properties.length} verified listings benchmarked with AI market valuation.
            </p>
          </div>
          <Link
            href="/explore"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>Switch to Map View</span>
          </Link>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Locality */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Locality
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="">All Pune Localities</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.slug}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa / Independent House</option>
              <option value="plot">Plot</option>
              <option value="office">Commercial Office</option>
              <option value="shop">Retail Shop</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bedrooms (BHK)
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Fair Price Assessment Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Fair Price Status
            </label>
            <select
              value={fairPriceStatus}
              onChange={(e) => setFairPriceStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="">All Price Statuses</option>
              <option value="Undervalued">Undervalued Only</option>
              <option value="Fairly priced">Fairly Priced</option>
              <option value="Slightly overpriced">Slightly Overpriced</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="newest">Recently Listed</option>
              <option value="fair_price">Best Value (Undervalued)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No properties match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your budget or selecting a different locality in Pune.
          </p>
          <button
            onClick={() => {
              setSelectedLocality("");
              setPropertyType("");
              setBedrooms("");
              setFairPriceStatus("");
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => {
            const isSaved = savedPropertyIds.has(p.id);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {p.primary_image ? (
                    <img
                      src={p.primary_image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-sm">
                      {p.property_type.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-semibold">
                      VERIFIED
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSave(p.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                      isSaved ? "bg-amber-500 text-white" : "bg-black/40 text-white hover:bg-black/60"
                    }`}
                    title={isSaved ? "Saved in Watchlist" : "Save to Watchlist"}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>

                  {/* Fair Price Badge */}
                  {p.fair_price_status && (
                    <div className={`absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold shadow ${
                      p.fair_price_status === "Undervalued"
                        ? "bg-emerald-600 text-white"
                        : p.fair_price_status === "Fairly priced"
                        ? "bg-sky-600 text-white"
                        : "bg-amber-600 text-white"
                    }`}>
                      {p.fair_price_status}
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{p.locality_name}, Pune</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 mb-2">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
                      {p.bedrooms > 0 && <span><b>{p.bedrooms}</b> BHK</span>}
                      <span><b>{p.bathrooms}</b> Baths</span>
                      <span><b>{p.carpet_area_sqft}</b> sq.ft.</span>
                      <span className="capitalize">{p.furnishing.replace('_', ' ')}</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-black text-slate-900">
                        {formatINR(p.asking_price)}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center justify-between mt-0.5">
                        <span>₹{p.price_per_sqft?.toLocaleString()}/sqft</span>
                        {p.estimated_value && (
                          <span className="text-[11px] text-sky-700 font-medium">
                            AI Value: {formatINR(p.estimated_value)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/properties/${p.id}`}
                    className="w-full text-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    View Valuation &amp; Comparables
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

