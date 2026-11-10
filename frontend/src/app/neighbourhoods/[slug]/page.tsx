"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Building2,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowLeft,
  Compass,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { Locality, Property, PropertyTransaction } from "@/types";
import { formatINR } from "@/lib/utils";

export default function LocalityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [locality, setLocality] = useState<Locality | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        setLoading(true);
        const [loc, props, txs] = await Promise.all([
          api.getNeighbourhoodDetail(slug),
          api.getProperties({ locality: slug, limit: 4 }),
          api.getTransactions({ locality: slug, limit: 4 })
        ]);
        setLocality(loc);
        setProperties(props);
        setTransactions(txs);
      } catch (err) {
        console.error("Failed to load locality profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading locality profile...</p>
      </div>
    );
  }

  if (!locality) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Locality Not Found</h2>
        <Link href="/neighbourhoods" className="px-4 py-2 bg-sky-600 text-white font-semibold text-xs rounded-xl">
          Return to Localities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/neighbourhoods"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pune Neighbourhoods</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                PUNE MICRO-MARKET
              </span>
              <span className="text-xs text-slate-500">PIN Code: {locality.pincode}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {locality.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {locality.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center min-w-32">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Livability Score</span>
              <span className="text-3xl font-black text-sky-600">{locality.livability_score}</span>
              <span className="text-[10px] text-slate-500 block">out of 10.0</span>
            </div>
            <Link
              href="/explore"
              className="p-4 rounded-2xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex flex-col items-center justify-center min-w-28 transition-colors"
            >
              <Compass className="w-6 h-6 mb-1" />
              <span>Explore Map</span>
            </Link>
          </div>
        </div>

        {/* Locality Financial & Urban Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Asking Price</span>
            <span className="text-lg font-black text-slate-900">₹{locality.avg_asking_price_sqft.toLocaleString()} / sqft</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Current seller listings</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <span className="text-[10px] text-emerald-700 uppercase font-bold block">Transacted Price</span>
            <span className="text-lg font-black text-emerald-900">₹{locality.avg_transacted_price_sqft.toLocaleString()} / sqft</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Registered sale deed avg</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Rental Yield</span>
            <span className="text-lg font-black text-slate-900">{locality.rental_yield_pct}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Annual tenant yield</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Business Density</span>
            <span className="text-lg font-black text-slate-900">{locality.business_density_per_sqkm} / km²</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Commercial concentration</span>
          </div>
        </div>
      </div>

      {/* Verified Infrastructure in Locality */}
      {locality.infrastructure && locality.infrastructure.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h2 className="font-bold text-lg text-slate-900 mb-1">Key Infrastructure &amp; Transit POIs</h2>
          <p className="text-xs text-slate-500 mb-4">Operational and upcoming transport, healthcare, and educational hubs.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {locality.infrastructure.map((inf) => (
              <div key={inf.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900">{inf.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                    inf.status === "operational" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {inf.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 uppercase mt-1 capitalize">{inf.category.replace('_', ' ')} • {inf.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Listings in this Locality */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-900">Active Listings in {locality.name}</h2>
          <Link href={`/properties?locality=${locality.slug}`} className="text-xs font-bold text-sky-600 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group"
            >
              <h3 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-sky-600 mb-1">
                {p.title}
              </h3>
              <div className="text-xs text-slate-500 mb-2">{p.bedrooms} BHK • {p.carpet_area_sqft} sqft</div>
              <div className="font-extrabold text-sm text-slate-900">{formatINR(p.asking_price)}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions in this Locality */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-900">Recent Registered Deeds in {locality.name}</h2>
          <Link href={`/sold?locality=${locality.slug}`} className="text-xs font-bold text-emerald-600 hover:underline">
            View All Deeds &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl border border-slate-200 p-4 text-xs">
              <span className="text-[10px] text-slate-400 block mb-1">{tx.transaction_date}</span>
              <div className="font-bold text-sm text-slate-900">{formatINR(tx.transacted_price)}</div>
              <div className="text-slate-500 mt-0.5">₹{tx.price_per_sqft.toLocaleString()}/sqft</div>
              <div className="text-[10px] text-slate-400 mt-2 truncate font-mono">{tx.document_ref}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

