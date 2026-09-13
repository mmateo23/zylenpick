import { describe, expect, it } from "vitest";
import { isManageChange, MANAGE_TOKEN_PATTERN, parseManagePrice } from "@/features/manage/validation";
import { createDefaultOpeningHours, getVenueOpeningStatus } from "@/features/venues/opening-hours";
import { getPricePresentation } from "@/features/pricing/price-display";

const itemId = "11111111-1111-4111-8111-111111111111";

describe("merchant changes", () => {
  it.each([["12,50",1250],["0",0],[" 9.99 ",999],["21474836.47",2147483647]])("parses decimal input %s as cents", (input, expected) => {
    expect(parseManagePrice(String(input))).toBe(expected);
  });
  it.each(["", "1e3", "-2", "12,345", "Infinity", "12abc", "21474836.48"])("rejects invalid price %s", (value) => {
    expect(parseManagePrice(value)).toBeNull();
  });
  it("requires a strong token format", () => {
    expect(MANAGE_TOKEN_PATTERN.test("a".repeat(64))).toBe(true);
    expect(MANAGE_TOKEN_PATTERN.test("a".repeat(63))).toBe(false);
    expect(MANAGE_TOKEN_PATTERN.test("%".repeat(64))).toBe(false);
  });
  it("rejects venue reassignment, privileged flags, strings for booleans and unknown operations", () => {
    for (const change of [
      { kind: "opening", value: true, venueId: itemId },
      { kind: "availability", itemId, value: "false" },
      { kind: "featured", itemId, value: true, isHomeFeatured: true },
      { kind: "delete", itemId },
      { kind: "opening" },
    ]) expect(isManageChange(change)).toBe(false);
  });
  it("allows non-numeric price modes without inventing an amount", () => {
    for (const mode of ["variable", "hidden"]) {
      expect(isManageChange({ kind: "price", itemId, mode, text: null })).toBe(true);
    }
    for (const mode of ["fixed", "from"]) {
      expect(isManageChange({ kind: "price", itemId, mode, text: null })).toBe(false);
      expect(isManageChange({ kind: "price", itemId, mode, text: null, amount: 1234 })).toBe(true);
      expect(isManageChange({ kind: "price", itemId, mode, text: null, amount: 12.34 })).toBe(false);
    }
    expect(isManageChange({ kind: "price", itemId, mode: "free", text: null })).toBe(false);
    expect(isManageChange({ kind: "price", itemId, mode: "variable", text: "a".repeat(81) })).toBe(false);
  });
  it("retains the existing public price presentation rules", () => {
    const item = { priceAmount: 1250, currency: "EUR", priceDisplayMode: "from" as const };
    expect(getPricePresentation(item).label).toContain("Desde");
    expect(getPricePresentation({ ...item, pricesVisible: false }).label).toBe("Contactar");
    expect(getPricePresentation({ ...item, priceDisplayMode: "variable", priceDisplayText: "Según peso" }).label).toBe("Según peso");
  });
});

describe("manual opening state", () => {
  it("overrides the current schedule without modifying it", () => {
    const hours = createDefaultOpeningHours();
    hours.fri = { isOpen: true, firstOpen: "10:00", firstClose: "22:00", secondOpen: "", secondClose: "" };
    const initial = structuredClone(hours);
    const date = new Date("2026-09-11T12:00:00Z");
    expect(getVenueOpeningStatus(hours, null, date).isOpenNow).toBe(true);
    expect(getVenueOpeningStatus(hours, false, date)).toMatchObject({ isOpenNow: false, source: "manual", minutesUntilChange: null });
    expect(getVenueOpeningStatus(hours, null, date).isOpenNow).toBe(true);
    expect(hours).toEqual(initial);
  });
  it("can open a venue that has no schedule", () => {
    expect(getVenueOpeningStatus(createDefaultOpeningHours(), true)).toMatchObject({ state: "open", source: "manual" });
  });
});
