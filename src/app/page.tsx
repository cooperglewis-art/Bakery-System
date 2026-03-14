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

const outcomes = [
  "Fewer missed details on custom orders",
  "Faster supplier invoice processing",
  "Clear prep planning for busy weeks",
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
        <div className="absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-stone-200/60 via-stone-100/30 to-transparent blur-3xl" />
        {/* Subtle accent orb bottom-left */}
        <div className="absolute bottom-[-10%] left-[-8%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-stone-200/40 via-stone-100/20 to-transparent blur-3xl" />
      </div>

      {/* ---- Nav / brand bar ---- */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-stone-900">
            Sweet Delights
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          Sign in
        </Link>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-auto max-w-5xl px-6 sm:px-8 pt-16 pb-24 sm:pt-28 sm:pb-32 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-6xl">
          Your bakery,
          <br />
          beautifully organized.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-stone-500 sm:text-xl">
          Built for small bakery teams that need less chaos and more control.
          Manage orders, costs, and prep in one place.
        </p>
        <ul className="mx-auto mt-6 max-w-xl space-y-2 text-sm text-stone-600 sm:text-base">
          {outcomes.map((outcome) => (
            <li key={outcome} className="flex items-center justify-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-700" />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-800 px-7 py-3.5 text-base font-semibold text-white shadow-apple transition-colors hover:bg-stone-900"
          >
            Start Free Demo
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
              className="group rounded-2xl bg-white/70 p-6 shadow-apple backdrop-blur transition-shadow hover:shadow-apple-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-stone-900">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-stone-200/60 py-10 text-center">
        <p className="text-sm text-stone-400">
          Sweet Delights Bakery &middot; Built with care
        </p>
      </footer>
    </div>
  );
}
