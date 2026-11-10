"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  Sparkles,
  Scale,
  ShieldCheck,
  FileText,
  Bookmark,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Download
} from "lucide-react";
import { api } from "@/lib/api";
import { PropertyDetail } from "@/types";
import { formatINR } from "@/lib/utils";

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getPropertyDetail(id);
        setProperty(data);
      } catch (err) {
        console.error("Failed to load property detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!property) return;
    try {
      setDownloadingPdf(true);
      const blob = await api.downloadValuationPDF({
        locality_id: property.locality_id,
        property_type: property.property_type,
        carpet_area_sqft: property.carpet_area_sqft,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        floor_number: property.floor_number,
        total_floors: property.total_floors,
        property_age_years: property.age_years,
        furnishing: property.furnishing,
        parking_count: property.parking_count,
        building_condition: property.building_condition,
        road_width_ft: property.road_width_ft,
        amenities: property.amenities,
        asking_price: property.asking_price
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PropValue_Valuation_${property.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading property intelligence...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Property Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The property listing you requested may have been removed or updated.</p>
        <Link href="/properties" className="px-4 py-2 bg-sky-600 text-white font-semibold text-xs rounded-xl">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to properties</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? "Saved" : "Save to Watchlist"}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingPdf ? "Generating..." : "Download PDF Report"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Image & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            {property.primary_image ? (
              <img
                src={property.primary_image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Building2 className="w-16 h-16" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-md bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
                {property.property_type.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold">
                VERIFIED REGISTRY ALIGNED
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.address}, {property.locality_name}, Pune - {property.pincode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Property Specifications Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-base text-slate-900 mb-4">Structural Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase text-[10px]">Carpet Area</span>
                <span className="font-bold text-slate-800 text-sm">{property.carpet_area_sqft} sq.ft.</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase text-[10px]">Bedrooms &amp; Baths</span>
                <span className="font-bold text-slate-800 text-sm">{property.bedrooms} BHK / {property.bathrooms} Baths</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase text-[10px]">Floor Position</span>
                <span className="font-bold text-slate-800 text-sm">Floor {property.floor_number} of {property.total_floors}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase text-[10px]">Furnishing</span>
                <span className="font-bold text-slate-800 text-sm capitalize">{property.furnishing.replace('_', ' ')}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase text-[10px]">Age of Building</span>
                <span className="font-bold text-slate-800 text-sm">{property.age_years} Years</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase text-[10px]">Parking Bays</span>
                <span className="font-bold text-slate-800 text-sm">{property.parking_count} Reserved</span>
              </div>
            </div>

            {property.amenities && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Amenities</span>
                <div className="flex flex-wrap gap-1.5">
                  {property.amenities.split(",").map((a, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                      ✓ {a.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Valuation & Fair Price Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 block mb-1">
              Pricing Analysis &amp; Valuation
            </span>

            {/* Asking Price */}
            <div className="mb-4">
              <span className="text-xs text-slate-500">Seller Asking Price</span>
              <div className="text-3xl font-black text-slate-900 mt-0.5">
                {formatINR(property.asking_price)}
              </div>
              <span className="text-xs text-slate-500">
                ₹{property.price_per_sqft?.toLocaleString()} / sq.ft.
              </span>
            </div>

            {/* Fair Price Status Pill */}
            <div className={`p-4 rounded-xl mb-4 border ${
              property.fair_price_status === "Undervalued"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : property.fair_price_status === "Fairly priced"
                ? "bg-sky-50 border-sky-200 text-sky-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Fair Price Status:</span>
                <span className="font-black text-sm">{property.fair_price_status}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {property.fair_price_status === "Undervalued"
                  ? "This property is priced below the estimated fair market baseline, presenting strong value relative to recent locality transactions."
                  : "Asking price aligns with current transaction benchmarks in this micro-market."}
              </p>
            </div>

            {/* AI Estimated Market Value */}
            <div className="p-4 rounded-xl bg-slate-900 text-white mb-6">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Estimated Fair Market Value</span>
              </div>
              <div className="text-2xl font-black text-white">
                {formatINR(property.estimated_value)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Variance: {property.price_difference_pct !== undefined && property.price_difference_pct > 0 ? "+" : ""}
                {property.price_difference_pct}% vs asking price
              </div>
            </div>

            {/* Investment Summary */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Gross Rental Yield:</span>
                <span className="font-bold text-emerald-600">{property.rental_yield_estimate}% / year</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Investment Score:</span>
                <span className="font-bold text-slate-900">{property.investment_score} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Verification Source:</span>
                <span className="font-medium text-slate-700">{property.source_name}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href={`/investment?budget=${property.asking_price}`}
                className="block w-full text-center py-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors"
              >
                Analyze Rental &amp; Appreciation ROI &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Properties Section */}
      {property.comparables && property.comparables.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Comparable Properties in {property.locality_name}</h3>
              <p className="text-xs text-slate-500">Similar properties identified via KNN geometric and spec similarity matching.</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
              {property.comparables.length} Matches Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Carpet Area</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Rate / sqft</th>
                  <th className="py-2.5 px-3">Similarity</th>
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {property.comparables.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-800">{comp.title}</td>
                    <td className="py-3 px-3 text-slate-500">{comp.distance_meters} m</td>
                    <td className="py-3 px-3">{comp.carpet_area_sqft} sqft</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatINR(comp.price)}</td>
                    <td className="py-3 px-3 text-slate-600">₹{comp.price_per_sqft.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                        {Math.round(comp.similarity_score * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 capitalize">{comp.record_type.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Nearby Infrastructure & Businesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Infrastructure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1">Nearby Infrastructure &amp; Transit</h3>
          <p className="text-xs text-slate-500 mb-4">Verified POIs in {property.locality_name}</p>
          <div className="space-y-2.5">
            {property.nearby_amenities?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{item.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase capitalize">{item.category.replace('_', ' ')}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 capitalize">
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Businesses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-base text-slate-900 mb-1">Surrounding Commercial Establishments</h3>
          <p className="text-xs text-slate-500 mb-4">Commercial density and nearby services</p>
          <div className="space-y-2.5">
            {property.nearby_businesses?.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{b.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase capitalize">{b.category}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">
                  {b.verification.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

