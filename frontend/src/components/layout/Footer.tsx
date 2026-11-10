import React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Database, Scale, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PropValue AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              AI-powered property valuation, fair price analysis, and market intelligence for Indian real estate.
              Bridging information asymmetry with transparent data provenance.
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Compliant with Indian DPDP Act standards</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/explore" className="hover:text-white transition-colors">Interactive Real Estate Map</Link></li>
              <li><Link href="/properties" className="hover:text-white transition-colors">Buy Properties Marketplace</Link></li>
              <li><Link href="/sold" className="hover:text-white transition-colors">Recently Sold Registry Deeds</Link></li>
              <li><Link href="/valuation" className="hover:text-white transition-colors">AI Property Valuation Engine</Link></li>
              <li><Link href="/fair-price" className="hover:text-white transition-colors">Fair Price Detector</Link></li>
              <li><Link href="/neighbourhoods" className="hover:text-white transition-colors">Neighbourhood Intelligence</Link></li>
            </ul>
          </div>

          {/* Investment & Analysis */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Analytics & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/businesses" className="hover:text-white transition-colors">Business Growth Map</Link></li>
              <li><Link href="/investment" className="hover:text-white transition-colors">Investment Opportunity Finder</Link></li>
              <li><Link href="/trends" className="hover:text-white transition-colors">Price Trends & Forecasts</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Property Comparison Workspace</Link></li>
              <li><Link href="/reports" className="hover:text-white transition-colors">Valuation PDF Reports</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Data Provenance & Admin</Link></li>
            </ul>
          </div>

          {/* Pune Market Coverage & Expansion */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Pune Coverage</h4>
            <p className="text-[11px] text-slate-400 mb-2">
              Active micro-markets: Hinjawadi, Wakad, Baner, Balewadi, Kharadi, Viman Nagar, Kothrud, Hadapsar, Magarpatta, Aundh, Bavdhan, Undri, Wagholi, Pimpri-Chinchwad.
            </p>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-medium text-slate-300 block mb-1">Pan-India Expansion Roadmap:</span>
              <span className="text-[10px] text-slate-400">
                1. Pune (Live) → 2. Mumbai MMR → 3. Bengaluru → 4. Hyderabad → 5. Delhi NCR
              </span>
            </div>
          </div>
        </div>

        {/* Data Provenance & Legal Disclaimers */}
        <div className="border-t border-slate-800/80 pt-6 mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between text-[11px] text-slate-400">
            <div className="space-y-1.5 max-w-4xl">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Statutory Methodology & Data Provenance Notice</span>
              </div>
              <p>
                PropValue AI strictly segregates advertised asking prices from verified registered sale deed transactions.
                Registered transaction data is referenced from publicly disclosed index records and MahaRERA filings.
                Geographic points of interest and road infrastructure are mapped using OpenStreetMap (© OpenStreetMap contributors, licensed under ODbL).
              </p>
              <p>
                DISCLAIMER: AI-generated valuations, fair price assessments, and investment forecasts are automated algorithmic estimates designed
                for market orientation. They do not constitute statutory registered valuations under the Indian Stamp Act, bank lending appraisals,
                structural safety audits, or guarantees of title or future capital appreciation. Always perform formal title due diligence with a qualified property advocate.
              </p>
            </div>
            <div className="text-slate-400 whitespace-nowrap self-end md:self-auto">
              © {new Date().getFullYear()} PropValue AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

