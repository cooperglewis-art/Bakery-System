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
  BarChart3,
  Settings,
  ChefHat,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "./sign-out-button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Ingredients", href: "/dashboard/ingredients", icon: Wheat },
  { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  { name: "Forecasting", href: "/dashboard/forecasting", icon: TrendingUp },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white/80 backdrop-blur-sm border-r border-border/60">
      {/* Logo */}
      <div className="flex h-18 items-center gap-3 px-5 border-b border-border/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-apple">
          <ChefHat className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground tracking-tight">Sweet Delights</span>
          <span className="text-xs text-muted-foreground">Bakery</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-5">
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                )}
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-border/60 p-3">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
            pathname === "/dashboard/settings"
              ? "bg-primary/8 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <Separator className="my-2 bg-border/60" />
        <SignOutButton />
      </div>
    </div>
  );
}
