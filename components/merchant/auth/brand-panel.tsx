import React from 'react';
import { Sparkles, TrendingUp, Users, ShieldCheck, Store } from 'lucide-react';

export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-neutral-900 via-neutral-950 to-zinc-900 text-white overflow-hidden border-r border-border/20">
      {/* Subtle ambient gradient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-linear-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            OfferNepal <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">Merchant</span>
          </h1>
          <p className="text-xs text-neutral-400 font-medium">Partner Growth Portal</p>
        </div>
      </div>

      {/* Main Pitch */}
      <div className="relative z-10 space-y-8 my-auto max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          The ENTERTAINER Model for Nepal
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Turn empty tables & off-peak hours into <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-200">predictable footfall.</span>
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            OfferNepal connects your venue to thousands of active subscription members seeking premier 2-for-1 dining, wellness, and lifestyle experiences.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid gap-4 pt-2">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Qualified Footfall Acquisition</p>
              <p className="text-xs text-neutral-400">Zero upfront advertising fees. You only fulfill offers when customers are at your venue.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transparent ROI & Settlement</p>
              <p className="text-xs text-neutral-400">Real-time ledger audit trails with direct bank payouts and zero hidden deductions.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Dual-Key Anti-Fraud Architecture</p>
              <p className="text-xs text-neutral-400">Merchant PIN + geofence protection prevents unauthorized deal redemptions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
        <span>© 2026 OfferNepal Inc. All rights reserved.</span>
        <span className="font-mono text-[11px] text-neutral-500">v1.0.0-PROD</span>
      </div>
    </div>
  );
}
