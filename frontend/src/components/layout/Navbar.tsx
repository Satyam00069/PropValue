"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  MapPin,
  TrendingUp,
  Search,
  Scale,
  Compass,
  Briefcase,
  Layers,
  FileText,
  Bookmark,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  Sparkles
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "/" },
    { label: "Explore Map", href: "/explore", icon: Compass },
    { label: "Buy Properties", href: "/properties", icon: Building2 },
    { label: "Recently Sold", href: "/sold", icon: Layers },
    { label: "AI Valuation", href: "/valuation", icon: Sparkles, badge: "AI" },
    { label: "Fair Price", href: "/fair-price", icon: Scale },
    { label: "Neighbourhoods", href: "/neighbourhoods", icon: MapPin },
    { label: "Business Growth", href: "/businesses", icon: Briefcase },
    { label: "Investment", href: "/investment", icon: TrendingUp },
    { label: "Trends", href: "/trends" },
    { label: "Compare", href: "/compare" },
    { label: "Reports", href: "/reports", icon: FileText },
  ];

  const userActionLinks = [
    { label: "Watchlist", href: "/watchlist", icon: Bookmark },
    { label: "Alerts", href: "/alerts", icon: Bell },
    { label: "Admin", href: "/admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* City & Compliance Top Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            LIVE MARKET
          </span>
          <span className="font-medium text-white">Pune, Maharashtra</span>
          <span className="hidden sm:inline text-slate-400">— 15 Locality Micro-Markets Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden md:inline">MahaRERA & IGR Public Registry Integrated</span>
          <div className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer">
            <span className="font-medium">City: Pune</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">PropValue</span>
                <span className="text-xl font-bold text-sky-600">AI</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 block -mt-1">
                Real Estate Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.slice(0, 8).map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                    active
                      ? "text-sky-600 bg-sky-50 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Dropdown for More */}
            <div className="relative group py-2">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1">
                More <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full right-0 hidden group-hover:block w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                {navLinks.slice(8).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-slate-100 my-1"></div>
                {userActionLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/valuation"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all hover:shadow-sky-500/25 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Estimate Value
            </Link>
            <Link
              href="/admin"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Settings & Admin"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              href="/valuation"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-lg"
            >
              Estimate
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  pathname === link.href ? "bg-sky-50 text-sky-600 font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            {userActionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

