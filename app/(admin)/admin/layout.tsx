'use client';

import dynamic from 'next/dynamic';

// Code-split the admin chrome into its own chunk so it is not statically pulled
// into the merchant/other route trees. Loaded client-side only.
const AdminSidebar = dynamic(
  () => import('@/lib/admin/components/admin-sidebar').then((m) => m.AdminSidebar),
  { ssr: false, loading: () => <div className="h-screen w-64 bg-muted/30" /> }
);

const AdminHeader = dynamic(
  () => import('@/lib/admin/components/admin-header').then((m) => m.AdminHeader),
  { ssr: false, loading: () => <div className="h-16 border-b bg-background" /> }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role check could be added here
  // For now, we'll rely on middleware for protection

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
