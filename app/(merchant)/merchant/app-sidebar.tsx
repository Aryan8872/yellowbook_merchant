"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, PanelLeft, Store } from "lucide-react";
import { sidebarItems } from "@/lib/constants/sidebar-item";
import { useAuth } from "@/lib/auth/auth-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-card/50 backdrop-blur-sm">
      
      {/* HEADER */}
      <SidebarHeader className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center font-bold">
            <Store className="h-5 w-5" />
          </div>

          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-foreground tracking-tight">
                OfferNepal
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Merchant Panel
              </span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 hover:bg-muted"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="py-4 px-3">
        <SidebarMenu>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive 
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    />
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 border-t border-border/50">
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/50 p-3 hover:bg-muted/80 transition-colors">
          
          {state === "expanded" && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {(user?.name || "M").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-xs truncate">
                  {user?.name || "Merchant Venue"}
                </p>
                <p className="text-muted-foreground text-[10px] truncate">
                  {user?.email || "admin@offernepal.com"}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Log out"
            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

    </Sidebar>
  );
}