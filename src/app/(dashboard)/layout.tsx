import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background transition-colors duration-200">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile navigation */}
      <MobileNav />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Add padding for mobile header and bottom nav */}
        <div className="min-h-full pt-14 pb-16 md:pt-0 md:pb-0">
          {children}
        </div>
      </main>

      <Toaster position="top-center" />
    </div>
  );
}
