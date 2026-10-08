import {
  Home,
  Ticket,
  Store,
  BarChart3,
  Receipt,
  Settings,
  Users,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/merchant/dashboard",
    icon: Home,
  },
  {
    title: "Offers",
    href: "/merchant/offers",
    icon: Ticket,
  },
  {
    title: "Branches",
    href: "/merchant/branches",
    icon: Store,
  },
  {
    title: "Staff",
    href: "/merchant/staff",
    icon: Users,
  },
  {
    title: "Redemptions",
    href: "/merchant/redemption",
    icon: Receipt,
  },
  {
    title: "Analytics",
    href: "/merchant/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/merchant/settings",
    icon: Settings,
  },
];