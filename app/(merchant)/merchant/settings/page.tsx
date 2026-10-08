'use client';

import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/merchant/profile-store';
import { GeneralProfileTab } from '@/components/merchant/settings/general-profile-tab';
// import { LegalTaxTab } from '@/components/merchant/settings/legal-tax-tab';
// import { BankPayoutTab } from '@/components/merchant/settings/bank-payout-tab';
// import { NotificationsTab } from '@/components/merchant/settings/notifications-tab';
import { Bell, Building2, FileText, Settings, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'legal' | 'payout' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const tabs = [
    { id: 'general', label: 'General Profile', icon: Store },
    // { id: 'legal', label: 'Legal & Tax', icon: FileText },
    // { id: 'payout', label: 'Payout & Settlement', icon: Building2 },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          Venue Settings & Configuration
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your OfferNepal partner storefront profile
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                isActive
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'general' && <GeneralProfileTab />}
        {/* {activeTab === 'legal' && <LegalTaxTab />} */}
        {/* {activeTab === 'payout' && <BankPayoutTab />} */}
        {/* {activeTab === 'notifications' && <NotificationsTab />} */}
      </div>
    </div>
  );
}
