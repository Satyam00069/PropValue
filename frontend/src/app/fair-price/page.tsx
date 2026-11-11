"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, Sparkles, Building2, MapPin, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { PUNE_LOCALITIES } from "@/lib/puneData";
import { Locality, FairPriceAssessment } from "@/types";
import { formatINR } from "@/lib/utils";

export default function FairPricePage() {
  const [localities, setLocalities] = useState<Locality[]>(PUNE_LOCALITIES);
  const [localityId, setLocalityId] = useState<string>(PUNE_LOCALITIES[0]?.id || "");
  const [askingPrice, setAskingPrice] = useState<number>(7500000);
  const [carpetArea, setCarpetArea] = useState<number>(1000);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [assessment, setAssessment] = useState<FairPriceAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadLocalities() {
      try {
        const locs = await api.getNeighbourhoods();
        setLocalities(locs);
        if (locs.length > 0) setLocalityId(locs[0].id);
      } catch (err) {
        console.error("Failed to load localities:", err);
      }
    }
    loadLocalities();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localityId || !askingPrice || !carpetArea) return;

    try {
      setLoading(true);
      const res = await api.analyseFairPrice({
        locality_id: localityId,
        asking_price: askingPrice,
        carpet_area_sqft: carpetArea,
        bedrooms: bedrooms
      });
      setAssessment(res);
    } catch (err: any) {
      alert(`Fair price analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Independent Price Due-Diligence Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Fair Price Detector
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Compare any seller&apos;s asking price against AI fair market benchmarks and recent registered transactions in Pune to discover whether a property is undervalued, fair, or overpriced.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Locality (Pune)
            </label>
            <select
              value={localityId}
              onChange={(e) => setLocalityId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
              required
            >
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Seller Asking Price (₹)
            </label>
            <input
              type="number"
              value={askingPrice}
              onChange={(e) => setAskingPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Carpet Area (sq.ft.)
            </label>
            <input
              type="number"
              value={carpetArea}
              onChange={(e) => setCarpetArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>{loading ? "Analyzing..." : "Detect Fair Price"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Assessment Output Display */}
      {assessment && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fair Price Assessment Verdict
                </span>
                <div className={`text-3xl font-black mt-1 ${
                  assessment.status === "Undervalued"
                    ? "text-emerald-600"
                    : assessment.status === "Fairly priced"
                    ? "text-sky-600"
                    : "text-amber-600"
                }`}>
                  {assessment.status}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Variance from Fair Market Value</span>
                <span className={`text-2xl font-black ${
                  assessment.difference_percentage < 0 ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {assessment.difference_percentage > 0 ? "+" : ""}{assessment.difference_percentage}%
                </span>
                <span className="text-xs text-slate-500 block">
                  ({formatINR(Math.abs(assessment.difference_rupees))} {assessment.difference_rupees < 0 ? "discount" : "premium"})
                </span>
              </div>
            </div>

            {/* Price Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Seller Asking Price</span>
                <span className="text-2xl font-black text-slate-900">{formatINR(assessment.asking_price)}</span>
                <span className="text-xs text-slate-500 block mt-0.5">₹{Math.round(assessment.asking_price / carpetArea).toLocaleString()} / sqft</span>
              </div>
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-center">
                <span className="text-[10px] text-sky-700 uppercase font-bold block mb-1">AI Estimated Fair Value</span>
                <span className="text-2xl font-black text-sky-900">{formatINR(assessment.estimated_value)}</span>
                <span className="text-xs text-sky-700 block mt-0.5">₹{Math.round(assessment.estimated_value / carpetArea).toLocaleString()} / sqft</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Comparable Property Range</span>
                <span className="text-lg font-black text-slate-800">{formatINR(assessment.comparable_range_low)} – {formatINR(assessment.comparable_range_high)}</span>
                <span className="text-xs text-slate-500 block mt-0.5">Local Registered Deeds</span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed mb-6">
              <span className="font-bold text-slate-900 block mb-1">Algorithmic Rationale:</span>
              {assessment.explanation}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Thresholds calibrated to Pune Sub-Registrar market standard distributions</span>
              </div>
              <Link
                href={`/valuation`}
                className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Run Detailed Spec-By-Spec Valuation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

