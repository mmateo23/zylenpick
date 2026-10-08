import { describe, expect, it } from "vitest";

import {
  formatEventDateRange,
  getEventTemporalState,
  getUpcomingEvents,
  publicEvents,
} from "../src/features/events/events";

describe("public events", () => {
  const autocross = publicEvents.find((event) => event.slug === "autocross-cerro-negro-2026");

  it("keeps the verified example in the upcoming agenda before it starts", () => {
    expect(autocross).toBeDefined();
    expect(getUpcomingEvents("2026-09-21").map((event) => event.slug)).toContain(
      "autocross-cerro-negro-2026",
    );
    expect(getEventTemporalState(autocross!, "2026-09-21")).toBe("upcoming");
  });

  it("treats the inclusive date range as ongoing", () => {
    expect(getEventTemporalState(autocross!, "2026-09-27")).toBe("ongoing");
    expect(formatEventDateRange(autocross!)).toBe("27 de septiembre de 2026");
    const multipleDays = { startsOn: "2026-10-16", endsOn: "2026-10-24" };
    expect(getEventTemporalState(multipleDays, "2026-10-24")).toBe("ongoing");
    expect(formatEventDateRange(multipleDays)).toBe("16–24 de octubre de 2026");
  });

  it("never exposes a past event as upcoming", () => {
    expect(getEventTemporalState(autocross!, "2026-09-28")).toBe("past");
    expect(getUpcomingEvents("2026-09-28")).not.toContainEqual(autocross);
  });
});
