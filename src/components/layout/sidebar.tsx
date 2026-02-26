"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Wheat,
  Receipt,
  TrendingUp,
  Settings,
  LogOut,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Ingredients", href: "/dashboard/ingredients", icon: Wheat },
  { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  { name: "Forecasting", href: "/dashboard/forecasting", icon: TrendingUp },
];

interface SidebarProps {
  onSignOut?: () => void;
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-amber-50 border-r border-amber-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-amber-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-amber-900">Sweet Delights</span>
          <span className="text-xs text-amber-600">Bakery</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-200 text-amber-900"
                    : "text-amber-700 hover:bg-amber-100 hover:text-amber-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-amber-200 p-3">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-amber-200 text-amber-900"
              : "text-amber-700 hover:bg-amber-100 hover:text-amber-900"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Separator className="my-2 bg-amber-200" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-amber-700 hover:bg-amber-100 hover:text-amber-900"
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
