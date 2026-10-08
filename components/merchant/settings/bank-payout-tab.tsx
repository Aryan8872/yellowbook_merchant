// 'use client';

// import React, { useState } from 'react';
// import { useProfileStore } from '@/lib/merchant/profile-store';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Building2, Calendar, CheckCircle2, DollarSign, Info, Loader2, ShieldCheck } from 'lucide-react';

export const NEPAL_COMMERCIAL_BANKS = [
  'Nabil Bank Ltd.',
  'NIC Asia Bank Ltd.',
  'Global IME Bank Ltd.',
  'Nepal Investment Mega Bank (NIMB)',
  'Everest Bank Ltd.',
  'Sanima Bank Ltd.',
  'Siddhartha Bank Ltd.',
  'Standard Chartered Bank Nepal Ltd.',
  'Rastriya Banijya Bank (RBB)',
  'NMB Bank Ltd.',
  'Prabhu Bank Ltd.',
  'Kumari Bank Ltd.',
  'Himalayan Bank Ltd.',
  'Prime Commercial Bank Ltd.',
  'Machhapuchchhre Bank Ltd.',
  'Citizens Bank International Ltd.',
];

// export function BankPayoutTab() {
//   const { payout, updatePayout, isSaving } = useProfileStore();

//   const [bankName, setBankName] = useState(payout?.bankName || NEPAL_COMMERCIAL_BANKS[0]);
//   const [accountHolderName, setAccountHolderName] = useState(payout?.accountHolderName || '');
//   const [accountNumber, setAccountNumber] = useState(payout?.accountNumber || '');
//   const [confirmAccountNumber, setConfirmAccountNumber] = useState(payout?.accountNumber || '');
//   const [branchName, setBranchName] = useState(payout?.branchName || '');
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFeedback(null);

//     if (accountNumber !== confirmAccountNumber) {
//       setFeedback({ type: 'error', message: 'Account numbers do not match. Please verify.' });
//       return;
//     }

//     const result = await updatePayout({
//       bankName,
//       accountHolderName,
//       accountNumber,
//       branchName,
//     });

//     if (result.success) {
//       setFeedback({ type: 'success', message: 'Bank settlement details updated successfully!' });
//     } else {
//       setFeedback({ type: 'error', message: result.message || 'Failed to update payout details.' });
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

//       {/* Automated Settlement Schedule Card */}
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div className="p-4 rounded-xl border border-border bg-card/60 flex items-start gap-3">
//           <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
//             <Calendar className="h-4 w-4" />
//           </div>
//           <div>
//             <p className="text-xs font-semibold text-foreground">Bi-Weekly Settlement Cycle</p>
//             <p className="text-[11px] text-muted-foreground mt-0.5">
//               Net BOGO reimbursement balances are disbursed on the <strong>1st</strong> and <strong>15th</strong> of each Gregorian calendar month.
//             </p>
//           </div>
//         </div>

//         <div className="p-4 rounded-xl border border-border bg-card/60 flex items-start gap-3">
//           <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
//             <DollarSign className="h-4 w-4" />
//           </div>
//           <div>
//             <p className="text-xs font-semibold text-foreground">Direct IPS / NCHL ACH Transfer</p>
//             <p className="text-[11px] text-muted-foreground mt-0.5">
//               Settlements transfer automatically via Nepal Clearing House without intermediary service charges.
//             </p>
//           </div>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-base font-bold flex items-center gap-2">
//             <Building2 className="h-4 w-4 text-primary" />
//             Class &apos;A&apos; Commercial Bank Account
//           </CardTitle>
//           <CardDescription className="text-xs">
//             Designate the business bank account that will receive your venue&apos;s OfferNepal payments
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-1.5">
//             <label className="text-xs font-semibold text-foreground">Select Commercial Bank</label>
//             <select
//               value={bankName}
//               onChange={(e) => setBankName(e.target.value)}
//               className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
//             >
//               {NEPAL_COMMERCIAL_BANKS.map((b) => (
//                 <option key={b} value={b}>
//                   {b}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-1.5">
//             <label className="text-xs font-semibold text-foreground">Account Holder Name (Exact Name on Cheque)</label>
//             <Input
//               value={accountHolderName}
//               onChange={(e) => setAccountHolderName(e.target.value)}
//               placeholder="e.g. Himalayan Hospitality & Culinary Ventures Pvt. Ltd."
//               required
//             />
//           </div>

//           <div className="grid sm:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-foreground">Bank Account Number</label>
//               <Input
//                 value={accountNumber}
//                 onChange={(e) => setAccountNumber(e.target.value)}
//                 placeholder="01901017500293"
//                 required
//               />
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-foreground">Confirm Bank Account Number</label>
//               <Input
//                 value={confirmAccountNumber}
//                 onChange={(e) => setConfirmAccountNumber(e.target.value)}
//                 placeholder="01901017500293"
//                 required
//               />
//             </div>
//           </div>

//           <div className="space-y-1.5">
//             <label className="text-xs font-semibold text-foreground">Bank Branch Location</label>
//             <Input
//               value={branchName}
//               onChange={(e) => setBranchName(e.target.value)}
//               placeholder="e.g. Durbar Marg Branch, Kathmandu"
//               required
//             />
//           </div>

//           <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-start gap-2.5 text-xs text-muted-foreground">
//             <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
//             <span>
//               Bank account verification takes up to 24 business hours upon initial entry. Settlements will pause if an account fails ACH verification.
//             </span>
//           </div>
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
//               Saving Payout Info...
//             </>
//           ) : (
//             'Save Payout Settings'
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }
