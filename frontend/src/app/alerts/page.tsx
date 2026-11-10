"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Sparkles
} from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      title: "Hinjawadi 2 BHK Undervalued Opportunities",
      locality: "Hinjawadi",
      alert_type: "undervalued_opportunity",
      criteria: "Max Budget ₹70L, Minimum 2 BHK",
      status: "Active",
      lastTriggered: "Yesterday, 14:30"
    },
    {
      id: "2",
      title: "Baner Price Drops (> 5%)",
      locality: "Baner",
      alert_type: "price_drop",
      criteria: "Any 3 BHK flat on Baner Road",
      status: "Active",
      lastTriggered: "3 days ago"
    },
    {
      id: "3",
      title: "Kharadi New Registered Sales Deeds",
      locality: "Kharadi",
      alert_type: "transaction_recorded",
      criteria: "Sub-Registrar recorded deeds near EON Free Zone",
      status: "Active",
      lastTriggered: "Nov 8, 2026"
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newLocality, setNewLocality] = useState("Wakad");
  const [newType, setNewType] = useState("undervalued_opportunity");
  const [newCriteria, setNewCriteria] = useState("Max ₹85L, 2 BHK or 3 BHK");
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item = {
      id: String(Date.now()),
      title: newTitle,
      locality: newLocality,
      alert_type: newType,
      criteria: newCriteria,
      status: "Active",
      lastTriggered: "Just now"
    };
    setAlerts([...alerts, item]);
    setNewTitle("");
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">User Alerts</span>
          <span>/</span>
          <span className="text-sky-600 font-medium">Notification Triggers</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Property Price &amp; Market Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Receive notifications for price drops, new undervalued listings, and newly recorded sales deeds.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Alert</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700">
                  {a.locality}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {a.alert_type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">Triggered: {a.lastTriggered}</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{a.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Criteria: {a.criteria}</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                {a.status}
              </span>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                title="Delete Alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 mb-1">Create Property Alert</h3>
            <p className="text-xs text-slate-500 mb-4">Set automated triggers for market price shifts in Pune.</p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">Alert Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wakad Under 75 Lakhs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">Locality</label>
                <select
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="Hinjawadi">Hinjawadi</option>
                  <option value="Wakad">Wakad</option>
                  <option value="Baner">Baner</option>
                  <option value="Balewadi">Balewadi</option>
                  <option value="Kharadi">Kharadi</option>
                  <option value="Viman Nagar">Viman Nagar</option>
                  <option value="Kothrud">Kothrud</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">Trigger Event</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="undervalued_opportunity">New Undervalued Listing Identified</option>
                  <option value="price_drop">Seller Asking Price Drop</option>
                  <option value="transaction_recorded">New Sub-Registrar Sale Deed Recorded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">Criteria Summary</label>
                <input
                  type="text"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

