"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ShieldCheck,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const sampleReports = [
    {
      id: "hinjawadi-2bhk",
      title: "Hinjawadi Phase 1 — 2 BHK Valuation Report",
      locality: "Hinjawadi",
      carpet: 780,
      bedrooms: 2,
      price: 5850000,
      generatedDate: "Nov 10, 2026",
      status: "Ready"
    },
    {
      id: "baner-3bhk",
      title: "Baner Balmoral — 3 BHK High-Rise Valuation Report",
      locality: "Baner",
      carpet: 1380,
      bedrooms: 3,
      price: 13900000,
      generatedDate: "Nov 09, 2026",
      status: "Ready"
    },
    {
      id: "kharadi-3bhk",
      title: "Kharadi EON Free Zone — 3 BHK Valuation Report",
      locality: "Kharadi",
      carpet: 1150,
      bedrooms: 3,
      price: 9800000,
      generatedDate: "Nov 08, 2026",
      status: "Ready"
    }
  ];

  const handleDownload = async (rep: any) => {
    try {
      setDownloading(rep.id);
      const blob = await api.downloadValuationPDF({
        locality_id: rep.locality,
        property_type: "apartment",
        carpet_area_sqft: rep.carpet,
        bedrooms: rep.bedrooms,
        bathrooms: 2,
        floor_number: 6,
        total_floors: 16,
        property_age_years: 3,
        furnishing: "semi_furnished",
        parking_count: 1,
        building_condition: "new",
        road_width_ft: 40,
        asking_price: rep.price
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PropValue_Valuation_${rep.locality}_${rep.carpet}sqft.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF report");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Reports Hub</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Downloadable Valuation Dossiers</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Valuation PDF Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Download formal, reproducible property valuation reports complete with SHAP factor breakdowns, comparables, and statutory disclaimers.
            </p>
          </div>
          <Link
            href="/valuation"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Report</span>
          </Link>
        </div>
      </div>

      {/* Reports Dossier Cards */}
      <div className="space-y-4 mb-8">
        {sampleReports.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-600 mt-0.5">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="font-bold text-sky-700">{r.locality}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{r.carpet} sq.ft. carpet</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">Generated: {r.generatedDate}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{r.title}</h3>
                <span className="text-xs text-slate-500">
                  Includes calibrated prediction interval, SHAP attribution, and 4 verified nearest comparables.
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDownload(r)}
              disabled={downloading === r.id}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading === r.id ? "Generating PDF..." : "Download PDF"}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Statutory Legal Disclaimer Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Statutory Disclaimer for Downloaded Valuation Dossiers</span>
        </div>
        <p className="leading-relaxed">
          PropValue AI generated PDF valuation reports are produced algorithmically using hedonic regression and machine learning ensembles
          trained on legally usable registration summaries and market data. They are designed for buyer and seller decision-support and market transparency.
          They do NOT replace physical inspections, structural engineering surveys, formal bank mortgage valuations, or advocate title searches.
        </p>
      </div>
    </div>
  );
}

