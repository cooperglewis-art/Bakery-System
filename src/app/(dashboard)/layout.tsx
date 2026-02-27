"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/client";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onSignOut={handleSignOut} />
      </div>

      {/* Mobile navigation */}
      <MobileNav onSignOut={handleSignOut} />

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
