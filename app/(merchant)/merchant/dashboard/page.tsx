import DashboardBody from "@/components/merchant/dashboardBody";
import DashboardStatHeader from "@/components/merchant/dashboardStatHeader";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function MerchantDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Merchant Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your merchant dashboard. Manage your offers, branches, and redemptions here.
      </p>

      <div className="flex flex-col gap-5">
        <ErrorBoundary title="Merchant Metrics Error">
          <DashboardStatHeader />
        </ErrorBoundary>
        <ErrorBoundary title="Merchant Dashboard Content Error">
          <DashboardBody />
        </ErrorBoundary>
      </div>
    </div>
  );
}