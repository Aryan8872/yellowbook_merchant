import React from 'react';
import { ShieldCheck, Activity, BarChart3, Users, Lock } from 'lucide-react';

export function AdminBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 text-white overflow-hidden border-r border-border/20">
      {/* Ambient gradient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            OfferNepal{' '}
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 font-semibold border border-indigo-400/30">
              Admin
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Platform Command Center</p>
        </div>
      </div>

      {/* Main Pitch */}
      <div className="relative z-10 space-y-8 my-auto max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium">
          <Lock className="h-3.5 w-3.5" />
          Restricted Access — Authorized Personnel Only
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Full platform oversight.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">
              Real-time intelligence.
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage merchants, monitor redemptions, review fraud flags, and track system health — all from a single unified command center.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid gap-4 pt-2">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Merchant & User Management</p>
              <p className="text-xs text-slate-400">Approve, suspend, and manage merchant accounts and end-user profiles.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Platform-Wide Analytics</p>
              <p className="text-xs text-slate-400">Revenue trends, customer acquisition, offer performance across all merchants.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">System Health Monitoring</p>
              <p className="text-xs text-slate-400">Live API uptime, Redis status, and infrastructure metrics at a glance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
        <span>© 2026 OfferNepal Inc. All rights reserved.</span>
        <span className="font-mono text-[11px] text-slate-600">v1.0.0-ADMIN</span>
      </div>
    </div>
  );
}
