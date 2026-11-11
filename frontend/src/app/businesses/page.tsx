"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  ShieldCheck,
  Building2,
  Coffee,
  UtensilsCrossed,
  Laptop,
  GraduationCap,
  Hospital,
  ShoppingBag,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { Business, BusinessGrowthStats, Locality } from "@/types";
import { PUNE_LOCALITIES, PUNE_BUSINESSES } from "@/lib/puneData";

export default function BusinessGrowthPage() {
  const [businesses, setBusinesses] = useState<Business[]>(PUNE_BUSINESSES);
  const [growthStats, setGrowthStats] = useState<BusinessGrowthStats[]>([]);
  const [localities, setLocalities] = useState<Locality[]>(PUNE_LOCALITIES);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    { label: "All Categories", value: "" },
    { label: "IT & Tech Companies", value: "it_company" },
    { label: "Restaurants & Dining", value: "restaurant" },
    { label: "Cafes & Coffee", value: "cafe" },
    { label: "Hospitals & Healthcare", value: "hospital" },
    { label: "Schools & Academics", value: "school" },
    { label: "Fitness & Gyms", value: "gym" },
    { label: "Retail & Supermarkets", value: "supermarket" },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bizs, stats, locs] = await Promise.all([
          api.getBusinesses({
            locality: selectedLocality || undefined,
            category: selectedCategory || undefined,
            search: searchName || undefined
          }),
          api.getBusinessGrowth(),
          api.getNeighbourhoods()
        ]);
        setBusinesses(bizs);
        setGrowthStats(stats);
        setLocalities(locs);
      } catch (err) {
        console.error("Failed to load business intelligence:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLocality, selectedCategory, searchName]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Business Growth Intelligence</span>
          <span>/</span>
          <span className="text-indigo-600 font-medium">Commercial Corridors</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Growth &amp; Commercial Activity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Track commercial clustering, tech campus nodes, and retail corridors across Pune to evaluate residential livability and commercial demand.
            </p>
          </div>
          <Link
            href="/explore"
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs self-start sm:self-auto"
          >
            View on Map
          </Link>
        </div>
      </div>

      {/* Commercial Corridors Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {growthStats.slice(0, 3).map((st, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">Commercial Node</span>
            <h3 className="font-extrabold text-base text-slate-900">{st.locality_name}</h3>
            <div className="flex items-center gap-4 my-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Establishments</span>
                <span className="font-bold text-slate-800 text-sm">{st.total_businesses}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Verified Operational</span>
                <span className="font-bold text-emerald-600 text-sm">{st.verified_operational_count}</span>
              </div>
            </div>
            {st.growth_corridors && st.growth_corridors.length > 0 && (
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Primary Corridor: </span>
                {st.growth_corridors[0]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Establishment
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Infosys, Starbucks"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">Loading commercial establishments...</div>
        ) : businesses.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">No businesses match the criteria.</div>
        ) : (
          businesses.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{b.name}</h3>
                  <span className="text-xs text-slate-500">{b.locality_name}, Pune</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">
                  {b.category.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold capitalize">
                  {b.status}
                </span>
                <span className="text-slate-400">
                  {b.verification_status === "confirmed_operational" ? "Verified Active" : "Newly Mapped"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Provenance note */}
      <div className="p-4 rounded-xl bg-slate-100/70 text-slate-600 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          Commercial POI data is sourced from verified OpenStreetMap contributors (ODbL) and direct field verifications. Newly mapped POIs are not assumed newly opened unless corroborated.
        </span>
      </div>
    </div>
  );
}

