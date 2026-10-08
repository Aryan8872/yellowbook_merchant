'use client';

import React, { useState } from 'react';
import { useProfileStore } from '@/lib/merchant/profile-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Info, Loader2, ShieldCheck } from 'lucide-react';

// TODO: Re-enable this tab when backend API supports legal/tax fields
// Currently commented out due to missing legalName and panNumber fields in MerchantProfile

export function LegalTaxTab() {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Legal & Tax settings are temporarily disabled.</p>
      <p className="text-sm">This feature will be available once the backend API is updated.</p>
    </div>
  );
}
