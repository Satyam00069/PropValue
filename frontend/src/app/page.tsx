"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  TrendingUp,
  Scale,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Briefcase,
  SlidersHorizontal,
  ChevronRight,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { PUNE_LOCALITIES, PUNE_PROPERTIES, PUNE_TRANSACTIONS } from "@/lib/puneData";
import { Property, PropertyTransaction, Locality } from "@/types";
import { formatINR } from "@/lib/utils";

export default function HomePage() {
  const [localities, setLocalities] = useState<Locality[]>(PUNE_LOCALITIES);
  const [properties, setProperties] = useState<Property[]>(PUNE_PROPERTIES.slice(0, 4));
  const [transactions, setTransactions] = useState<PropertyTransaction[]>(PUNE_TRANSACTIONS.slice(0, 4));
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("apartment");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [locs, props, txs] = await Promise.all([
          api.getNeighbourhoods(),
          api.getProperties({ limit: 4 }),
          api.getTransactions({ limit: 4 })
        ]);
        setLocalities(locs);
        setProperties(props);
        setTransactions(txs);
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India&apos;s 1st Explainable Real Estate Intelligence Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Know the Real Value of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Every Property.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              AI-powered property valuation, market intelligence, and investment insights for smarter real estate decisions. Initial market: Pune, Maharashtra.
            </p>
          </div>

          {/* Interactive Hero Search Box */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-900 border border-slate-100">
            {/* Tab switchers: Buy, Sell, Analyse */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4 text-xs font-semibold">
              <button className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 font-bold">
                Buy Properties
              </button>
              <Link href="/valuation" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                Estimate Property Value
              </Link>
              <Link href="/fair-price" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                Analyse Fair Price
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5 relative">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Locality / Micro-Market (Pune)
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50">
                  <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none text-slate-800"
                  >
                    <option value="">All Pune Localities</option>
                    {localities.map((loc) => (
                      <option key={loc.id} value={loc.slug}>
                        {loc.name} (₹{loc.avg_transacted_price_sqft.toLocaleString()}/sqft)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Property Type
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50">
                  <Building2 className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none text-slate-800"
                  >
                    <option value="apartment">Apartment / Flat</option>
                    <option value="villa">Villa / Row House</option>
                    <option value="plot">Residential Plot</option>
                    <option value="office">Commercial Office</option>
                    <option value="shop">Retail Shop</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3 pt-4 sm:pt-0">
                <Link
                  href={`/properties?locality=${selectedLocality}&property_type=${propertyType}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Link>
              </div>
            </div>

            {/* Quick Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Quick explore:</span>
                <Link href="/explore" className="text-sky-600 hover:underline font-medium">Explore Pune Map</Link>
                <span>•</span>
                <Link href="/sold" className="text-sky-600 hover:underline font-medium">Verified Sold Deeds</Link>
                <span>•</span>
                <Link href="/investment" className="text-sky-600 hover:underline font-medium">Top Yield Opportunities</Link>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Unfabricated Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARKET METRICS SUMMARY */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">15</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pune Priority Localities</span>
            </div>
            <div className="p-3 border-l border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-sky-600">₹7,850</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Price / Sq.Ft.</span>
            </div>
            <div className="p-3 border-l border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-indigo-600">4.1%</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Rental Yield</span>
            </div>
            <div className="p-3 border-l border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600">MahaRERA</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">&amp; IGR Deed Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR PUNE NEIGHBOURHOODS */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Micro-Market Benchmarks</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Popular Neighbourhoods in Pune
              </h2>
            </div>
            <Link
              href="/neighbourhoods"
              className="mt-3 md:mt-0 text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View all 15 Pune localities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localities.slice(0, 6).map((loc) => (
              <Link
                key={loc.id}
                href={`/neighbourhoods/${loc.slug}`}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                      {loc.name}
                    </h3>
                    <span className="text-xs text-slate-500">PIN: {loc.pincode} • Pune</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold">
                    Score {loc.livability_score} / 10
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  {loc.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Avg Transacted Rate</span>
                    <span className="font-semibold text-slate-800">₹{loc.avg_transacted_price_sqft.toLocaleString()}/sqft</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Rental Yield</span>
                    <span className="font-semibold text-emerald-600">{loc.rental_yield_pct}% gross</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECENTLY ADDED VERIFIED LISTINGS */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Property Marketplace</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Active Verified Listings
              </h2>
            </div>
            <Link
              href="/properties"
              className="mt-3 md:mt-0 text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Browse all properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Property Image */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
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
                  {/* Fair Price Badge */}
                  {p.fair_price_status && (
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
                      p.fair_price_status === "Undervalued"
                        ? "bg-emerald-600 text-white"
                        : p.fair_price_status === "Fairly priced"
                        ? "bg-sky-600 text-white"
                        : "bg-amber-600 text-white"
                    }`}>
                      {p.fair_price_status}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                    {p.locality_name}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      {p.bedrooms > 0 ? `${p.bedrooms} BHK • ` : ""}{p.carpet_area_sqft} sq.ft. carpet
                    </p>

                    <div className="mb-3">
                      <div className="text-lg font-extrabold text-slate-900">
                        {formatINR(p.asking_price)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ₹{p.price_per_sqft?.toLocaleString()}/sqft • Estimated: {formatINR(p.estimated_value)}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/properties/${p.id}`}
                    className="w-full text-center py-2 px-3 rounded-lg border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-xs font-semibold text-slate-700 hover:text-sky-600 transition-colors"
                  >
                    View Valuation &amp; Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECENTLY RECORDED TRANSACTIONS (GROUND TRUTH) */}
      <section className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Ground Truth Data</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700">Official Deeds</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Recently Sold Registered Properties
              </h2>
            </div>
            <Link
              href="/sold"
              className="mt-3 md:mt-0 text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Explore all registered deeds <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{tx.locality_name}</span>
                  <span className="font-medium text-slate-600">{tx.transaction_date}</span>
                </div>
                <div className="text-base font-bold text-slate-900 mb-1">
                  {formatINR(tx.transacted_price)}
                </div>
                <div className="text-xs text-slate-600 mb-3">
                  {tx.unit_type || "Apartment"} • {tx.carpet_area_sqft} sq.ft. (₹{tx.price_per_sqft.toLocaleString()}/sqft)
                </div>
                <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="truncate">Ref: <span className="font-mono text-slate-700">{tx.document_ref}</span></div>
                  <div className="truncate text-emerald-700 font-medium">{tx.data_source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW PROPVALUE AI WORKS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Methodology</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              How PropValue AI Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Replacing gut feeling and broker bias with explainable machine learning and actual registered deed benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ground Truth Data Sourcing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We ingest verified transaction records from Maharashtra IGR registration index summaries, MahaRERA project filings, and OpenStreetMap infrastructure data.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gradient Boosted ML Valuation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our supervised hedonic and LightGBM models evaluate structural specs, floor elevation, age depreciation, transit proximity, and micro-market price momentum.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">SHAP Explainability &amp; Fair Price</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every valuation exposes feature-by-feature rupee attributions (SHAP values) and conformal confidence intervals, categorizing whether a property is Undervalued or Overpriced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA CALL TO ACTION */}
      <section className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to Verify the True Market Value of Any Property?
          </h2>
          <p className="text-sky-100 text-sm max-w-xl mx-auto mb-6">
            Get an instant, transparent AI valuation report complete with comparable sales and fair price indicators.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/valuation"
              className="px-6 py-3 rounded-xl bg-white text-sky-800 font-bold text-sm shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Estimate Property Value</span>
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-xl bg-sky-900/60 hover:bg-sky-900 text-white border border-white/20 font-semibold text-sm transition-all"
            >
              Open Interactive Real Estate Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

