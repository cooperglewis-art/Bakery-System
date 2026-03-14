import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUSINESS_RUNTIME_SETTINGS,
  parseBusinessRuntimeSettings,
} from "../../src/lib/business-settings";

describe("parseBusinessRuntimeSettings", () => {
  it("returns defaults when settings are missing", () => {
    const result = parseBusinessRuntimeSettings(null);
    expect(result).toEqual(DEFAULT_BUSINESS_RUNTIME_SETTINGS);
  });

  it("parses valid tax rate and prefix", () => {
    const result = parseBusinessRuntimeSettings([
      { key: "tax_rate", value: 0.0825 },
      { key: "order_number_prefix", value: "BK" },
    ]);

    expect(result.taxRate).toBe(0.0825);
    expect(result.orderNumberPrefix).toBe("BK");
  });

  it("bounds invalid tax rates and falls back for bad prefix", () => {
    const result = parseBusinessRuntimeSettings([
      { key: "tax_rate", value: 4.5 },
      { key: "order_number_prefix", value: "" },
    ]);

    expect(result.taxRate).toBe(1);
    expect(result.orderNumberPrefix).toBe(
      DEFAULT_BUSINESS_RUNTIME_SETTINGS.orderNumberPrefix
    );
  });
});
