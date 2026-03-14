"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Receipt,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsDropdown } from "./notifications-dropdown";

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top header bar for mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="text-xs font-bold text-primary-foreground">SD</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">Sweet Delights</span>
        </div>

        <div className="flex items-center gap-1">
          <NotificationsDropdown />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom navigation bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/90 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-around">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/60"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/50"
                )} />
                <span className={cn(
                  "font-medium",
                  isActive && "text-primary"
                )}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
