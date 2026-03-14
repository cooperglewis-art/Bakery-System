import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  ORDER_NUMBER_PREFIX,
  TAX_RATE,
} from "@/lib/config";

type SettingsRow = {
  key: string;
  value: unknown;
};

export interface BusinessRuntimeSettings {
  orderNumberPrefix: string;
  taxRate: number;
}

export const DEFAULT_BUSINESS_RUNTIME_SETTINGS: BusinessRuntimeSettings = {
  orderNumberPrefix: ORDER_NUMBER_PREFIX,
  taxRate: TAX_RATE,
};

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toString(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

export function parseBusinessRuntimeSettings(
  rows: SettingsRow[] | null | undefined
): BusinessRuntimeSettings {
  if (!rows || rows.length === 0) {
    return DEFAULT_BUSINESS_RUNTIME_SETTINGS;
  }

  const map = new Map(rows.map((row) => [row.key, row.value]));
  const taxRateRaw = map.get("tax_rate");
  const prefixRaw = map.get("order_number_prefix");

  const taxRate = toNumber(taxRateRaw, TAX_RATE);
  const boundedTaxRate = Math.max(0, Math.min(1, taxRate));

  return {
    taxRate: boundedTaxRate,
    orderNumberPrefix: toString(prefixRaw, ORDER_NUMBER_PREFIX),
  };
}

export async function getBusinessRuntimeSettings(
  supabase: SupabaseClient<Database>
): Promise<BusinessRuntimeSettings> {
  const { data, error } = await supabase
    .from("business_settings")
    .select("key, value")
    .in("key", ["tax_rate", "order_number_prefix"]);

  if (error) {
    console.error("Failed to load business runtime settings:", error);
    return DEFAULT_BUSINESS_RUNTIME_SETTINGS;
  }

  return parseBusinessRuntimeSettings(data);
}
