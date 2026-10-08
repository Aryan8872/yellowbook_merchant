'use client';

import React, { useState, useEffect } from 'react';
import { useProfileStore } from '@/lib/merchant/profile-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, Image as ImageIcon, Loader2, Sparkles, Store } from 'lucide-react';

export function GeneralProfileTab() {
  const { profile, updateProfile, isSaving } = useProfileStore();

  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [category, setCategory] = useState('Dining');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setTradeName(profile.name || '');
      setLegalName(profile.name || '');
      setCategory('Dining');
      setBio(profile.description || '');
      setContactEmail(profile.contactEmail || '');
      setContactPhone(profile.contactPhone || '');
      setLogoPreview(profile.logoUrl || '');
      setCoverPreview(profile.coverUrl || '');
    }
  }, [profile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'Logo file size must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'Cover image must be less than 4MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const result = await updateProfile({
      name: tradeName,
      description: bio,
      contactEmail,
      contactPhone,
      logoUrl: logoPreview,
      coverUrl: coverPreview,
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message || 'Profile saved successfully!' });
    } else {
      setFeedback({ type: 'error', message: result.message || 'Failed to update profile.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* Visual Identity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-500" />
            Venue Visual Identity
          </CardTitle>
          <CardDescription className="text-xs">
            These visual assets are showcased across the OfferNepal Consumer App to attract subscribers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Banner */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Cover Banner (16:9 Landscape)</span>
              <span className="text-[11px] text-muted-foreground font-normal">Max 4MB (PNG, JPG, WebP)</span>
            </label>
            <div className="relative group rounded-xl overflow-hidden border border-border h-44 bg-muted/30 flex items-center justify-center">
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground gap-2">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Upload venue hero photograph</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1">
                <Camera className="h-6 w-6" />
                <span className="text-xs font-semibold">Change Cover Banner</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Logo Dropzone */}
          <div className="flex items-center gap-6">
            <div className="relative group h-24 w-24 rounded-2xl border-2 border-border overflow-hidden bg-muted/40 shrink-0 flex items-center justify-center shadow-xs">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                <Camera className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Change</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold">Brand Logo (1:1 Square)</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Recommended 500x500px. Appears next to your venue name in offer listings and push alerts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            General Business Details
          </CardTitle>
          <CardDescription className="text-xs">
            Basic contact and categorical classification for your establishment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Customer-Facing Trade Name</label>
              <Input
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="e.g. The Himalayan Grill & Lounge"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Primary Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Dining">Dining & Nightlife</option>
                <option value="Wellness">Wellness & Spa</option>
                <option value="Entertainment">Entertainment & Leisure</option>
                <option value="Retail">Retail & Fashion</option>
                <option value="Services">Services & Hospitality</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Venue Bio / About</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell OfferNepal subscribers what makes your venue exceptional..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Official Contact Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="admin@venue.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Contact Phone Number</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+977-9841234567"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-6 shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
