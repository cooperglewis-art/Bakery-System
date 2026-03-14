export const TAX_RATE = 0.075;
export const TAX_RATE_DISPLAY = "7.5%";
export const ORDER_NUMBER_PREFIX = "SD";

export const TIME_SLOTS = [
  { value: "morning", label: "Morning (8am-12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-4pm)" },
  { value: "evening", label: "Evening (4pm-7pm)" },
] as const;

export function getTimeSlotLabel(value: string): string {
  return TIME_SLOTS.find((s) => s.value === value)?.label || value;
}

export function formatTaxRateDisplay(taxRate: number): string {
  const percent = taxRate * 100;
  const rounded = Math.round(percent * 100) / 100;
  return `${rounded}%`;
}
