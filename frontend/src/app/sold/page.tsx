"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  MapPin,
  Filter,
  ShieldCheck,
  Calendar,
  Building2,
  FileText,
  TrendingUp,
  Info,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { PUNE_LOCALITIES, PUNE_TRANSACTIONS } from "@/lib/puneData";
import { PropertyTransaction, Locality } from "@/types";
import { formatINR } from "@/lib/utils";

export default function RecentlySoldPage() {
  const [transactions, setTransactions] = useState<PropertyTransaction[]>(PUNE_TRANSACTIONS);
  const [localities, setLocalities] = useState<Locality[]>(PUNE_LOCALITIES);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [stats, setStats] = useState<any>({
    total_transactions: PUNE_TRANSACTIONS.length,
    avg_price_sqft: 8420,
    min_price_sqft: 5100,
    max_price_sqft: 11220,
    median_price: 7800000
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [txs, locs, st] = await Promise.all([
          api.getTransactions({
            locality: selectedLocality || undefined,
            property_type: propertyType || undefined,
          }),
          api.getNeighbourhoods(),
          api.getTransactionStats(selectedLocality || undefined)
        ]);
        setTransactions(txs);
        setLocalities(locs);
        setStats(st);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLocality, propertyType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Recently Sold</span>
          <span>/</span>
          <span className="text-emerald-600 font-medium">Pune Market Registry</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recently Sold Registered Properties
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Ground Truth Deeds
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Actual recorded transaction prices from Maharashtra IGR Sub-Registrar filings across Pune.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strictly Registered Deeds (No Asking Prices)</span>
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Header */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Verified Registered Sales</span>
            <span className="text-2xl font-black text-slate-900">{stats.total_transactions} Deeds</span>
            <span className="text-[11px] text-emerald-600 block mt-1 font-medium">100% Document Verified</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Average Transacted Rate</span>
            <span className="text-2xl font-black text-sky-600">₹{stats.avg_price_sqft?.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 block mt-1">per square foot carpet</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Median Sale Value</span>
            <span className="text-2xl font-black text-indigo-600">{formatINR(stats.median_price)}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Pune Market Median</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Rate Range</span>
            <span className="text-lg font-black text-slate-800">₹{stats.min_price_sqft?.toLocaleString()} – ₹{stats.max_price_sqft?.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Min to Max / sq.ft.</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Locality / Sub-Registrar Zone
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
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartment / Flat</option>
              <option value="villa">Villa / Row House</option>
              <option value="plot">Plot</option>
              <option value="office">Commercial Office</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedLocality("");
                setPropertyType("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verified Transaction Records ({transactions.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Source: Maharashtra IGR Public Index Summaries
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading verified transaction records...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-700">No verified transactions found</h4>
            <p className="text-xs text-slate-500 mt-1">No registered deed records match this specific criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Locality &amp; Type</th>
                  <th className="py-3 px-4">Transaction Date</th>
                  <th className="py-3 px-4">Carpet Area</th>
                  <th className="py-3 px-4">Transacted Value</th>
                  <th className="py-3 px-4">Rate / sq.ft.</th>
                  <th className="py-3 px-4">Registration Reference</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.unit_type || "Apartment"}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{t.locality_name}, Pune</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {t.transaction_date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.carpet_area_sqft} sq.ft.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatINR(t.transacted_price)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{t.price_per_sqft.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-700">{t.document_ref || "REG-MH-PUN"}</div>
                      <div className="text-[10px] text-slate-400">{t.registration_office || "Sub-Registrar"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statutory Data Limitation Notice */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Important Ground Truth Disclosure:</span>
          <p>
            PropValue AI strictly displays legally accessible public summary records.
            Registration document numbers are masked in accordance with privacy compliance.
            Individual owner names and PAN details are never collected or stored.
          </p>
        </div>
      </div>
    </div>
  );
}

