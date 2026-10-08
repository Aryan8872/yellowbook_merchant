// 'use client';

// import React, { useState } from 'react';
// import { useProfileStore } from '@/lib/merchant/profile-store';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Bell, CheckCircle2, DollarSign, Flame, Loader2, Mail } from 'lucide-react';

// export function NotificationsTab() {
//   const { notifications, updateNotifications, isSaving } = useProfileStore();

//   const [dailyDigest, setDailyDigest] = useState(notifications?.emailDailyDigest ?? true);
//   const [highValueAlerts, setHighValueAlerts] = useState(notifications?.emailHighValueAlerts ?? true);
//   const [settlementUpdates, setSettlementUpdates] = useState(notifications?.emailSettlementUpdates ?? true);
//   const [marketingUpdates, setMarketingUpdates] = useState(notifications?.marketingUpdates ?? false);
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFeedback(null);

//     const result = await updateNotifications({
//       emailDailyDigest: dailyDigest,
//       emailHighValueAlerts: highValueAlerts,
//       emailSettlementUpdates: settlementUpdates,
//       marketingUpdates,
//     });

//     if (result.success) {
//       setFeedback({ type: 'success', message: 'Notification preferences updated!' });
//     } else {
//       setFeedback({ type: 'error', message: result.message || 'Failed to update preferences.' });
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {feedback && (
//         <div
//           className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
//             feedback.type === 'success'
//               ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
//               : 'bg-destructive/10 border border-destructive/20 text-destructive'
//           }`}
//         >
//           {feedback.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
//           {feedback.message}
//         </div>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-base font-bold flex items-center gap-2">
//             <Bell className="h-4 w-4 text-primary" />
//             Email Alert Channels
//           </CardTitle>
//           <CardDescription className="text-xs">
//             Manage operational emails delivered to your registered merchant address
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card/40 cursor-pointer hover:bg-muted/30 transition-colors">
//             <input
//               type="checkbox"
//               checked={dailyDigest}
//               onChange={(e) => setDailyDigest(e.target.checked)}
//               className="mt-1 h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
//             />
//             <div className="space-y-0.5">
//               <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
//                 <Mail className="h-3.5 w-3.5 text-muted-foreground" />
//                 Daily Evening Redemption Digest
//               </p>
//               <p className="text-[11px] text-muted-foreground">
//                 Receive an aggregated summary report every night at 11:00 PM NPT summarizing total footfall, redeemed vouchers, and estimated customer savings.
//               </p>
//             </div>
//           </label>

//           <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card/40 cursor-pointer hover:bg-muted/30 transition-colors">
//             <input
//               type="checkbox"
//               checked={highValueAlerts}
//               onChange={(e) => setHighValueAlerts(e.target.checked)}
//               className="mt-1 h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
//             />
//             <div className="space-y-0.5">
//               <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
//                 <Flame className="h-3.5 w-3.5 text-amber-500" />
//                 High-Value Redemption Alerts
//               </p>
//               <p className="text-[11px] text-muted-foreground">
//                 Receive instant email notifications whenever an offer with estimated customer value over NPR 2,000 is redeemed at any of your branches.
//               </p>
//             </div>
//           </label>

//           <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card/40 cursor-pointer hover:bg-muted/30 transition-colors">
//             <input
//               type="checkbox"
//               checked={settlementUpdates}
//               onChange={(e) => setSettlementUpdates(e.target.checked)}
//               className="mt-1 h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
//             />
//             <div className="space-y-0.5">
//               <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
//                 <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
//                 Settlement & Payout Confirmations
//               </p>
//               <p className="text-[11px] text-muted-foreground">
//                 Bank transaction reference numbers and payment advice notes sent immediately following ACH bank transfers.
//               </p>
//             </div>
//           </label>

//           <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card/40 cursor-pointer hover:bg-muted/30 transition-colors">
//             <input
//               type="checkbox"
//               checked={marketingUpdates}
//               onChange={(e) => setMarketingUpdates(e.target.checked)}
//               className="mt-1 h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
//             />
//             <div className="space-y-0.5">
//               <p className="text-xs font-semibold text-foreground">
//                 OfferNepal Partner Growth & Insights
//               </p>
//               <p className="text-[11px] text-muted-foreground">
//                 Product announcements, consumer footfall trend reports, and best practices for maximizing BOGO deal uptake.
//               </p>
//             </div>
//           </label>
//         </CardContent>
//       </Card>

//       <div className="flex justify-end">
//         <Button
//           type="submit"
//           disabled={isSaving}
//           className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-6 shadow-sm"
//         >
//           {isSaving ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Saving Preferences...
//             </>
//           ) : (
//             'Save Preferences'
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }
