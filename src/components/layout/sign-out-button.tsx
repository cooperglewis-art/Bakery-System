"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
      onClick={handleSignOut}
    >
      <LogOut className="h-[18px] w-[18px]" />
      Sign out
    </Button>
  );
}
