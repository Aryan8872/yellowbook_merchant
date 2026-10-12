import { redirect } from 'next/navigation';

// The admin dashboard is served at /admin (the index route).
// Redirect /admin/dashboard → /admin to avoid duplicate routes.
export default function AdminDashboardSubPage() {
  redirect('/admin');
}
