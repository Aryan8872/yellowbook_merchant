import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">Merchant Workspace</span>
            </div>
          </header>
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

