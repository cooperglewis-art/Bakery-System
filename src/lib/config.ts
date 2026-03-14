export const TIME_SLOTS = [
  { value: "morning", label: "Morning (8am-12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-4pm)" },
  { value: "evening", label: "Evening (4pm-7pm)" },
] as const;

export function getTimeSlotLabel(value: string): string {
  return TIME_SLOTS.find((s) => s.value === value)?.label || value;
}
