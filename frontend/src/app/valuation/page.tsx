"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Building2,
  MapPin,
  Scale,
  Download,
  Info,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { api } from "@/lib/api";
import { Locality, ValuationResponse } from "@/types";
import { formatINR } from "@/lib/utils";

export default function ValuationPage() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [localityId, setLocalityId] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("apartment");
  const [carpetArea, setCarpetArea] = useState<number>(950);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [floorNumber, setFloorNumber] = useState<number>(5);
  const [totalFloors, setTotalFloors] = useState<number>(14);
  const [propertyAge, setPropertyAge] = useState<number>(3);
  const [furnishing, setFurnishing] = useState<string>("semi_furnished");
  const [parkingCount, setParkingCount] = useState<number>(1);
  const [buildingCondition, setBuildingCondition] = useState<string>("new");
  const [roadWidth, setRoadWidth] = useState<number>(40);
  const [metroDistance, setMetroDistance] = useState<number>(1.2);
  const [askingPrice, setAskingPrice] = useState<string>("6800000");

  const [valuationResult, setValuationResult] = useState<ValuationResponse | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    async function loadLocalities() {
      try {
        const locs = await api.getNeighbourhoods();
        setLocalities(locs);
        if (locs.length > 0) {
          setLocalityId(locs[0].id);
        }
      } catch (err) {
        console.error("Failed to load localities:", err);
      }
    }
    loadLocalities();
  }, []);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localityId) return;

    try {
      setCalculating(true);
      const parsedAsking = askingPrice ? parseFloat(askingPrice) : undefined;
      const res = await api.estimateValuation({
        locality_id: localityId,
        property_type: propertyType,
        carpet_area_sqft: carpetArea,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        floor_number: floorNumber,
        total_floors: totalFloors,
        property_age_years: propertyAge,
        furnishing: furnishing,
        parking_count: parkingCount,
        building_condition: buildingCondition,
        road_width_ft: roadWidth,
        distance_to_metro_km: metroDistance,
        asking_price: parsedAsking
      });
      setValuationResult(res);
    } catch (err: any) {
      alert(`Valuation computation failed: ${err.message}`);
    } finally {
      setCalculating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!valuationResult) return;
    try {
      setDownloadingPdf(true);
      const blob = await api.downloadValuationPDF({
        locality_id: localityId,
        property_type: propertyType,
        carpet_area_sqft: carpetArea,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        floor_number: floorNumber,
        total_floors: totalFloors,
        property_age_years: propertyAge,
        furnishing: furnishing,
        parking_count: parkingCount,
        building_condition: buildingCondition,
        road_width_ft: roadWidth,
        distance_to_metro_km: metroDistance,
        asking_price: askingPrice ? parseFloat(askingPrice) : undefined
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PropValue_Valuation_${valuationResult.locality_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">AI Valuation Engine</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Supervised Hedonic + LightGBM</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Property Valuation Engine
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            SHAP Explainable
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Enter structural specifications and location parameters to calculate an explainable, data-backed fair market property valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Property Input Characteristics</span>
            <span className="text-[11px] text-slate-400 font-normal">Pune Micro-Markets</span>
          </h2>

          <form onSubmit={handleEstimate} className="space-y-4 text-xs">
            {/* Locality */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Locality (Pune)
              </label>
              <select
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                required
              >
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} (Avg ₹{loc.avg_transacted_price_sqft.toLocaleString()}/sqft)
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type & Carpet Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa / Row House</option>
                  <option value="independent_house">Independent House</option>
                  <option value="office">Commercial Office</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Carpet Area (Sq.Ft.)
                </label>
                <input
                  type="number"
                  min="200"
                  max="10000"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Bedrooms (BHK)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Floor Number & Total Floors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Total Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Age & Furnishing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Structure Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={propertyAge}
                  onChange={(e) => setPropertyAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi-Furnished</option>
                  <option value="furnished">Fully Furnished</option>
                </select>
              </div>
            </div>

            {/* Condition & Parking */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Building Condition
                </label>
                <select
                  value={buildingCondition}
                  onChange={(e) => setBuildingCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="new">New Construction (&lt; 2 yrs)</option>
                  <option value="good">Good / Well-Maintained</option>
                  <option value="fair">Fair</option>
                  <option value="needs_renovation">Needs Renovation</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Parking Spaces
                </label>
                <select
                  value={parkingCount}
                  onChange={(e) => setParkingCount(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="0">0 (Open Street)</option>
                  <option value="1">1 Covered Bay</option>
                  <option value="2">2 Covered Bays</option>
                  <option value="3">3+ Bays</option>
                </select>
              </div>
            </div>

            {/* Optional Asking Price for Fair Price Analysis */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Optional: Current Seller Asking Price (INR)
              </label>
              <input
                type="number"
                placeholder="e.g. 6800000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 font-bold text-sky-900 focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Providing an asking price triggers the Fair Price Detector comparison.
              </span>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>{calculating ? "Running AI Hedonic Engine..." : "Calculate AI Valuation"}</span>
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {valuationResult ? (
            <div className="space-y-6">
              {/* Executive Valuation Summary Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      {valuationResult.model_type}
                    </span>
                    <span className="text-xs text-slate-500">Model {valuationResult.model_version}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{valuationResult.confidence_label} Confidence ({Math.round(valuationResult.confidence_score * 100)}%)</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-1">
                  Estimated Fair Market Value ({valuationResult.locality_name})
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                  {formatINR(valuationResult.estimated_value)}
                </div>

                {/* Conformal Prediction Bounds */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">10th Percentile Bound</span>
                    <span className="font-bold text-slate-700">{formatINR(valuationResult.estimated_low)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Rate / Sq.Ft.</span>
                    <span className="font-bold text-sky-600">₹{valuationResult.estimated_price_sqft.toLocaleString()} / sqft</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">90th Percentile Bound</span>
                    <span className="font-bold text-slate-700">{formatINR(valuationResult.estimated_high)}</span>
                  </div>
                </div>

                {/* Calibrated Distribution Comparison Chart */}
                <div className="my-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Conformal Price Distribution &amp; Locality Baseline</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Values in INR</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "10th %ile", value: valuationResult.estimated_low, color: "#94a3b8" },
                          { name: "Locality Avg", value: valuationResult.locality_benchmark_sqft * carpetArea, color: "#64748b" },
                          { name: "AI Valuation", value: valuationResult.estimated_value, color: "#0284c7" },
                          { name: "90th %ile", value: valuationResult.estimated_high, color: "#94a3b8" },
                          ...(valuationResult.fair_price ? [{ name: "Asking Price", value: valuationResult.fair_price.asking_price, color: "#f59e0b" }] : [])
                        ]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={10} stroke="#64748b" />
                        <YAxis
                          fontSize={10}
                          stroke="#64748b"
                          tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                        />
                        <Tooltip
                          formatter={(v: any) => [formatINR(Number(v)), "Price"]}
                          contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", fontSize: "11px" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {[
                            { color: "#94a3b8" },
                            { color: "#64748b" },
                            { color: "#0284c7" },
                            { color: "#94a3b8" },
                            { color: "#f59e0b" }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fair Price Detector Banner if available */}
                {valuationResult.fair_price && (
                  <div className={`p-4 rounded-xl border text-xs mb-4 ${
                    valuationResult.fair_price.status === "Undervalued"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : valuationResult.fair_price.status === "Fairly priced"
                      ? "bg-sky-50 border-sky-200 text-sky-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="uppercase tracking-wider text-[10px]">Fair Price Verdict:</span>
                      <span className="text-sm">{valuationResult.fair_price.status}</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{valuationResult.fair_price.explanation}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPdf}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingPdf ? "Building PDF..." : "Download Formal Valuation Report (PDF)"}</span>
                  </button>
                  <Link
                    href={`/investment?budget=${valuationResult.estimated_value}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Investment ROI &amp; Cash Flow
                  </Link>
                </div>
              </div>

              {/* SHAP Feature Attribution Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-1">Feature Attribution (SHAP Explanations)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Quantified price impact of individual property attributes relative to {valuationResult.locality_name} baseline.
                </p>

                <div className="space-y-3">
                  {valuationResult.explanations.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{exp.feature_name}</span>
                        <span className={`font-black ${
                          exp.impact_direction === "positive"
                            ? "text-emerald-600"
                            : exp.impact_direction === "negative"
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}>
                          {exp.shap_value > 0 ? "+" : ""}{formatINR(exp.shap_value)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{exp.explanation_text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearest Comparable Transactions */}
              {valuationResult.comparables && valuationResult.comparables.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900 mb-1">Nearest Comparable Properties</h3>
                  <p className="text-xs text-slate-500 mb-4">Similar physical units in {valuationResult.locality_name}</p>

                  <div className="space-y-2.5">
                    {valuationResult.comparables.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-800 block">{c.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {c.carpet_area_sqft} sqft • {c.distance_meters}m away • {c.source}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 block">{formatINR(c.price)}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">
                            {Math.round(c.similarity_score * 100)}% Similarity
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <Sparkles className="w-12 h-12 text-sky-400 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800">Ready to Compute Valuation</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Select your Pune locality and parameters on the left, then click &ldquo;Calculate AI Valuation&rdquo; to generate calibrated price bounds and SHAP explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

