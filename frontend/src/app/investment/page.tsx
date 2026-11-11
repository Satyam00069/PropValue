"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Filter,
  DollarSign,
  Calculator,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { InvestmentOpportunity, Locality, EMICalculatorResponse } from "@/types";
import { formatINR } from "@/lib/utils";

import { PUNE_LOCALITIES, getClientInvestmentOpportunities } from "@/lib/puneData";

export default function InvestmentPage() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>(getClientInvestmentOpportunities());
  const [localities, setLocalities] = useState<Locality[]>(PUNE_LOCALITIES);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [minYield, setMinYield] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // EMI Calculator states
  const [calcPrice, setCalcPrice] = useState<number>(7500000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [emiResult, setEmiResult] = useState<EMICalculatorResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [opps, locs] = await Promise.all([
          api.getInvestmentOpportunities({
            locality: selectedLocality || undefined,
            max_budget: maxBudget ? parseFloat(maxBudget) : undefined,
            min_yield: minYield ? parseFloat(minYield) : undefined,
          }),
          api.getNeighbourhoods()
        ]);
        setOpportunities(opps);
        setLocalities(locs);
      } catch (err) {
        console.error("Failed to load investment opportunities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLocality, maxBudget, minYield]);

  // Run EMI calculator
  useEffect(() => {
    async function runCalc() {
      if (calcPrice < 100000) return;
      try {
        const res = await api.calculateEMI({
          property_price: calcPrice,
          down_payment_pct: downPaymentPct,
          annual_interest_rate: interestRate,
          loan_tenure_years: tenureYears,
          registration_stamp_duty_pct: 7.0
        });
        setEmiResult(res);
      } catch (err) {
        console.error("EMI calculation error:", err);
      }
    }
    runCalc();
  }, [calcPrice, downPaymentPct, interestRate, tenureYears]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Investment Intelligence</span>
          <span>/</span>
          <span className="text-emerald-600 font-medium">Opportunity Finder</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Investment Opportunities &amp; Yield Finder
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Yield Ranked
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Discover undervalued properties and high-rental-yield opportunities across Pune micro-markets with automated cash flow simulations.
        </p>
      </div>

      {/* Main Grid: Left Opportunities, Right Mortgage Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Opportunities List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Locality
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Max Investment Budget (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Min Rental Yield (%)
                </label>
                <select
                  value={minYield}
                  onChange={(e) => setMinYield(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
                >
                  <option value="">Any Yield</option>
                  <option value="3.5">&gt; 3.5% Annual</option>
                  <option value="4.0">&gt; 4.0% Annual</option>
                  <option value="4.3">&gt; 4.3% (Top Quartile)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No opportunities match criteria</h3>
              <p className="text-xs text-slate-400 mt-1">Try raising your budget limit or lowering yield threshold.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <div
                  key={opp.property_id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5"
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-44 h-36 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                    {opp.primary_image ? (
                      <img
                        src={opp.primary_image}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      Score: {opp.investment_score}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{opp.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          opp.fair_price_status === "Undervalued"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-sky-100 text-sky-800"
                        }`}>
                          {opp.fair_price_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {opp.locality_name} • {opp.bedrooms} BHK • {opp.carpet_area_sqft} sqft
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Asking Price</span>
                          <span className="font-black text-slate-900 block">{formatINR(opp.asking_price)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Value</span>
                          <span className="font-bold text-sky-700 block">{formatINR(opp.estimated_market_value)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Yield</span>
                          <span className="font-bold text-emerald-600 block">{opp.estimated_rental_yield_pct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 italic line-clamp-1">
                        {opp.recommendation_reason}
                      </span>
                      <Link
                        href={`/properties/${opp.property_id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex-shrink-0 transition-colors"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mortgage & EMI Financing Calculator */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="font-bold text-base text-slate-900">EMI &amp; Financing Calculator</h2>
              <span className="text-[11px] text-slate-400">Maharashtra Stamp Duty &amp; Cess included</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                Property Purchase Price (₹)
              </label>
              <input
                type="number"
                step="100000"
                value={calcPrice}
                onChange={(e) => setCalcPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                  Down Payment ({downPaymentPct}%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(parseFloat(e.target.value) || 20)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 8.5)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                Loan Tenure (Years)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* EMI Output Box */}
          {emiResult && (
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Home Loan EMI</span>
                <div className="text-3xl font-black text-sky-400 mt-0.5">
                  ₹{Math.round(emiResult.monthly_emi).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Principal Loan Amount:</span>
                  <span className="font-bold text-white">{formatINR(emiResult.loan_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Down Payment (Equity):</span>
                  <span className="font-bold text-white">{formatINR(emiResult.down_payment_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Interest Payable:</span>
                  <span className="font-bold text-amber-400">{formatINR(emiResult.total_interest_payable)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stamp Duty &amp; Registration (7%):</span>
                  <span className="font-bold text-white">{formatINR(emiResult.stamp_duty_and_registration)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
                  <span>Total Purchase Cost:</span>
                  <span>{formatINR(emiResult.total_estimated_purchase_cost)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 flex items-start gap-1.5 pt-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Estimates do not include lender processing fees or insurance premiums. Subject to underwriting approval.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

