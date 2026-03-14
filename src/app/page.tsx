import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  BarChart3,
  Wheat,
  ScanText,
  ChefHat,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Orders & Customers",
    description:
      "Track every order from request to delivery. Keep your customers happy and your workflow smooth.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Understand your busiest days, top products, and revenue trends at a glance.",
  },
  {
    icon: Wheat,
    title: "Ingredient Forecasting",
    description:
      "Predict demand accurately so you never run out of stock or over-order.",
  },
  {
    icon: ScanText,
    title: "Invoice OCR",
    description:
      "Snap a photo of supplier invoices and let AI extract the data for you.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ---- Background decoration ---- */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Warm gradient orb top-right */}
        <div className="absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-stone-200/60 via-stone-100/30 to-transparent dark:from-stone-800/30 dark:via-stone-900/20 blur-3xl" />
        {/* Subtle accent orb bottom-left */}
        <div className="absolute bottom-[-10%] left-[-8%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-stone-200/40 via-stone-100/20 to-transparent dark:from-stone-800/20 dark:via-stone-900/10 blur-3xl" />
      </div>

      {/* ---- Nav / brand bar ---- */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800 dark:bg-stone-200">
            <ChefHat className="h-5 w-5 text-white dark:text-stone-800" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Sweet Delights
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-auto max-w-5xl px-6 sm:px-8 pt-16 pb-24 sm:pt-28 sm:pb-32 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
          Your bakery,
          <br />
          beautifully organized.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Order management, smart analytics, and ingredient forecasting —
          everything you need to run your bakery with clarity.
        </p>
        <div className="mt-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-800 dark:bg-stone-200 px-7 py-3.5 text-base font-semibold text-white dark:text-stone-800 shadow-apple transition-colors hover:bg-stone-900 dark:hover:bg-stone-300"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="mx-auto max-w-5xl px-6 sm:px-8 pb-28 sm:pb-36">
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-card/70 p-6 shadow-apple backdrop-blur transition-shadow hover:shadow-apple-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border/60 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Sweet Delights Bakery &middot; Built with care
        </p>
      </footer>
    </div>
  );
}
