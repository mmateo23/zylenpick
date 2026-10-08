import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => {
  const single = vi.fn();
  const maybeSingle = vi.fn();
  const query: Record<string, ReturnType<typeof vi.fn>> = { single, maybeSingle };
  for (const name of ["from", "update", "eq", "select"]) query[name] = vi.fn(() => query);
  return { query, authorize: vi.fn(() => query) };
});
vi.mock("@/features/admin/services/admin-auth", () => ({
  createAdminMutationClient: db.authorize,
  createAdminDataClient: db.authorize,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); }) }));
import { updateVenueOpeningHoursAction } from "@/features/admin/services/venues-admin-service";

function form() {
  const data = new FormData();
  data.set("openingHours.mon.isOpen", "on");
  data.set("openingHours.mon.firstOpen", "10:00");
  data.set("openingHours.mon.firstClose", "22:00");
  data.set("name", "Must not overwrite venue identity");
  return data;
}
describe("focused hours editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.authorize.mockResolvedValue(db.query);
    db.query.single.mockResolvedValue({ data: { id: "venue-one" }, error: null });
    db.query.maybeSingle.mockResolvedValue({ data: { slug: "local", cities: { slug: "talavera" } }, error: null });
  });
  it("requires administrator authorization before touching data", async () => {
    db.authorize.mockRejectedValueOnce(new Error("Unauthorized"));
    await expect(updateVenueOpeningHoursAction("venue-one", form())).rejects.toThrow("Unauthorized");
    expect(db.query.update).not.toHaveBeenCalled();
  });
  it("updates only opening_hours on the selected venue", async () => {
    await expect(updateVenueOpeningHoursAction("venue-one", form())).rejects.toThrow("guardado=1");
    expect(db.query.eq).toHaveBeenCalledWith("id", "venue-one");
    const change = db.query.update.mock.calls[0][0];
    expect(Object.keys(change)).toEqual(["opening_hours"]);
    expect(change.opening_hours.mon.firstOpen).toBe("10:00");
  });
  it("rejects incomplete opening times without writing", async () => {
    const data = form(); data.delete("openingHours.mon.firstClose");
    await expect(updateVenueOpeningHoursAction("venue-one", data)).rejects.toThrow("Completa");
    expect(db.query.update).not.toHaveBeenCalled();
  });
  it("does not report success when no venue was updated", async () => {
    db.query.single.mockResolvedValueOnce({ data: null, error: null });
    await expect(updateVenueOpeningHoursAction("missing", form())).rejects.toThrow("No se ha podido");
  });
});
