"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Products", href: "/dashboard/products", icon: Package },
];

interface MobileNavProps {
  onSignOut?: () => void;
}

export function MobileNav({ onSignOut }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Top header bar for mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-amber-200 bg-amber-50 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
            <span className="text-sm font-bold text-white">SD</span>
          </div>
          <span className="font-semibold text-amber-900">Sweet Delights</span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-amber-700">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onSignOut={onSignOut} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom navigation bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-amber-200 bg-white md:hidden">
        <div className="flex h-16 items-center justify-around">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-amber-700"
                    : "text-gray-500"
                )}
              >
                <item.icon className={cn(
                  "h-6 w-6",
                  isActive && "text-amber-600"
                )} />
                <span className={cn(
                  "font-medium",
                  isActive && "text-amber-700"
                )}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
