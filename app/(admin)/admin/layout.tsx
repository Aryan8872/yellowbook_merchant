import { redirect } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';
import { UserRole } from '@/lib/auth/permissions';
import { AdminSidebar } from '@/lib/admin/components/admin-sidebar';
import { AdminHeader } from '@/lib/admin/components/admin-header';

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
