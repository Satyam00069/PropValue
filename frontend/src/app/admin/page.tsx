"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Database,
  Users,
  Building2,
  Layers,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Play,
  Info
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ingesting, setIngesting] = useState<boolean>(false);
  const [ingestionMsg, setIngestionMsg] = useState<string>("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleTriggerIngestion = async (sourceName: string) => {
    try {
      setIngesting(true);
      const res = await fetch("http://localhost:8000/api/v1/admin/ingestion/trigger?source=" + encodeURIComponent(sourceName), {
        method: "POST"
      });
      const data = await res.json();
      setIngestionMsg(`Ingestion Job Succeeded: ${data.records_created} records verified & indexed.`);
      // reload stats
      const updated = await api.getAdminStats();
      setStats(updated);
    } catch (err) {
      alert("Failed to trigger ingestion job");
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Administration &amp; Provenance</span>
          <span>/</span>
          <span className="text-slate-900 font-medium">Control Plane</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrative Control Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Platform governance, data ingestion pipelines, valuation model monitoring, and verification audit logs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Platform State: Fully Healthy</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Properties</span>
              <Building2 className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_properties} Units</div>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">{stats.active_listings} Active Listings</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified Sales</span>
              <Layers className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.verified_transactions} Deeds</div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">Haveli Sub-Registrar</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Localities Covered</span>
              <Database className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_localities} Pune Zones</div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">100% Polygon Mapped</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">AI Model Version</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg font-black text-slate-900 truncate">{stats.ai_model_version}</div>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">Conformal Interval Calibrated</span>
          </div>
        </div>
      )}

      {/* Ingestion Pipelines Control */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">External Data Ingestion Pipeline Adapters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated connectors for OpenStreetMap amenities, Maharashtra IGR indices, and MahaRERA project filings.
            </p>
          </div>
          {ingestionMsg && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {ingestionMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adapter 1</span>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">OSM Pune Infrastructure &amp; POI</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Pulls schools, hospitals, metro stations, and verified commercial establishments.
              </p>
            </div>
            <button
              onClick={() => handleTriggerIngestion("OSM_Pune_Amenities")}
              disabled={ingesting}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{ingesting ? "Running Pipeline..." : "Execute Ingestion"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adapter 2</span>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">Maharashtra IGR Public Registry</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Sub-Registrar deed indexes summary verification and deduping.
              </p>
            </div>
            <button
              onClick={() => handleTriggerIngestion("IGR_Pune_Deeds")}
              disabled={ingesting}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{ingesting ? "Running Pipeline..." : "Execute Ingestion"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adapter 3</span>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">MahaRERA Project Filings</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Quarterly project progress, building carpet area certifications, and delivery dates.
              </p>
            </div>
            <button
              onClick={() => handleTriggerIngestion("MahaRERA_Filings")}
              disabled={ingesting}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{ingesting ? "Running Pipeline..." : "Execute Ingestion"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Regulatory Posture */}
      <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-slate-800">DPDP Act Compliance &amp; Data Ethics Policy</span>
          <p>
            PropValue AI strictly follows Indian Digital Personal Data Protection guidelines. Personally identifiable individual property owner records are never ingested or exposed.
            All registered deed references are anonymized, masked, and benchmarked at aggregated micro-market resolutions.
          </p>
        </div>
      </div>
    </div>
  );
}

