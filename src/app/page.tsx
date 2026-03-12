import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-800 shadow-lg">
            <ChefHat className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          Sweet Delights
        </h1>
        <p className="text-xl text-stone-700 mb-2">Bakery</p>
        <p className="text-stone-600 mb-8">
          Order management and inventory forecasting
        </p>
        <Link href="/login">
          <Button size="lg" className="bg-stone-800 hover:bg-stone-900 text-lg px-8">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
