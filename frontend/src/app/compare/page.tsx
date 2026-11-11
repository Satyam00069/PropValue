"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  Building2,
  MapPin,
  Check,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download
} from "lucide-react";
import { api } from "@/lib/api";
import { Property } from "@/types";
import { formatINR } from "@/lib/utils";

import { PUNE_PROPERTIES } from "@/lib/puneData";

export default function ComparePage() {
  const [allProperties, setAllProperties] = useState<Property[]>(PUNE_PROPERTIES);
  const [selectedIds, setSelectedIds] = useState<string[]>([PUNE_PROPERTIES[0]?.id || "", PUNE_PROPERTIES[1]?.id || ""]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadProps() {
      try {
        setLoading(true);
        const props = await api.getProperties();
        setAllProperties(props);
        if (props.length >= 2) {
          setSelectedIds([props[0].id, props[1].id]);
        }
      } catch (err) {
        console.error("Failed to load comparison list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProps();
  }, []);

  useEffect(() => {
    async function fetchMatrix() {
      if (selectedIds.length === 0) {
        setComparisonData([]);
        return;
      }
      try {
        const matrix = await api.comparePropertiesMatrix(selectedIds);
        setComparisonData(matrix);
      } catch (err) {
        console.error("Failed to run comparison matrix:", err);
      }
    }
    fetchMatrix();
  }, [selectedIds]);

  const toggleProperty = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 5) {
        alert("You can compare up to 5 properties simultaneously.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Comparison Workspace</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Multi-Property Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Property Comparison Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Compare up to 5 properties side-by-side across asking price, AI fair market valuation, carpet area rate, structural age, and rental yield.
        </p>
      </div>

      {/* Property Selection Pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Select Properties to Compare ({selectedIds.length}/5 selected):
        </span>
        <div className="flex flex-wrap gap-2">
          {allProperties.map((p) => {
            const active = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleProperty(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{p.title}</span>
                {active ? <Check className="w-3.5 h-3.5" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {comparisonData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Select at least one property above to display side-by-side comparison metrics.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-slate-100">
              {/* Image & Title Header Row */}
              <tr className="bg-slate-50">
                <td className="p-4 font-bold text-slate-500 w-44">Property</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 min-w-[200px]">
                    <div className="h-28 w-full rounded-xl bg-slate-200 overflow-hidden mb-2">
                      {c.primary_image ? (
                        <img src={c.primary_image} alt={c.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{c.title}</h4>
                    <span className="text-[11px] text-slate-500">{c.locality_name}, Pune</span>
                  </td>
                ))}
              </tr>

              {/* Asking Price */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Asking Price</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 font-extrabold text-slate-900 text-base">
                    {formatINR(c.asking_price)}
                  </td>
                ))}
              </tr>

              {/* AI Estimated Market Value */}
              <tr className="bg-sky-50/40">
                <td className="p-4 font-bold text-sky-800">AI Estimated Value</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 font-black text-sky-900 text-base">
                    {formatINR(c.estimated_value)}
                  </td>
                ))}
              </tr>

              {/* Fair Price Verdict */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Fair Price Status</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      c.fair_price_status === "Undervalued"
                        ? "bg-emerald-100 text-emerald-800"
                        : c.fair_price_status === "Fairly priced"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {c.fair_price_status}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Rate / Sq.Ft. */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Rate / Sq.Ft.</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 font-semibold text-slate-800">
                    ₹{c.price_per_sqft?.toLocaleString()} / sqft
                  </td>
                ))}
              </tr>

              {/* Carpet Area */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Carpet Area</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 font-medium text-slate-700">
                    {c.carpet_area_sqft} sq.ft.
                  </td>
                ))}
              </tr>

              {/* Bedrooms & Baths */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Configuration</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 text-slate-700">
                    {c.bedrooms} BHK / {c.bathrooms} Baths
                  </td>
                ))}
              </tr>

              {/* Floor Level */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Floor Level</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 text-slate-700">
                    Floor {c.floor_number} of {c.total_floors}
                  </td>
                ))}
              </tr>

              {/* Age & Condition */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Age &amp; Condition</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 text-slate-700 capitalize">
                    {c.age_years} yrs • {c.building_condition?.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              {/* Rental Yield */}
              <tr>
                <td className="p-4 font-bold text-slate-600">Gross Rental Yield</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4 font-bold text-emerald-600">
                    {c.rental_yield_pct}%
                  </td>
                ))}
              </tr>

              {/* Action Link */}
              <tr className="bg-slate-50">
                <td className="p-4 font-bold text-slate-500">Action</td>
                {comparisonData.map((c) => (
                  <td key={c.id} className="p-4">
                    <Link
                      href={`/properties/${c.id}`}
                      className="inline-block px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                    >
                      Inspect Property
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

