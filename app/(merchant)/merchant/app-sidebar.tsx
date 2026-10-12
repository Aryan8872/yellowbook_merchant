"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, PanelLeft, Store } from "lucide-react"
import { sidebarItems } from "@/lib/constants/sidebar-item"
import { useAuth } from "@/lib/auth/auth-context"

export function AppSidebar() {
  const pathname = usePathname()
  const { toggleSidebar, state } = useSidebar()
  const { user, logout } = useAuth()

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-card/50 backdrop-blur-sm"
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-border/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {state === "expanded" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-white shadow-md shadow-amber-500/20">
                <Store className="h-5 w-5" />
              </div>
            )}

            {state === "expanded" && (
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm leading-tight font-bold tracking-tight text-foreground">
                  OfferNepal
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Merchant
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                        isActive
                          ? "bg-amber-500/10 font-medium text-amber-700 shadow-sm dark:text-amber-400"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    />
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-border/50 p-3">
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/50 p-3 transition-colors hover:bg-muted/80">
          {state === "expanded" && (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white shadow-sm">
                {(user?.name || "M").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name || "Merchant Venue"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
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
            className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
