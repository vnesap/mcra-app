import { buildRoomLink } from "@/lib/roomLink";
import { describe, expect, it } from "vitest";

describe("roomLink", () => {
  it("builds a shareable room link that lands on the classroom page", () => {
    const link = buildRoomLink("ABC123");
    expect(link).toBe(`${window.location.origin}/classroom/ABC123`);
  });

  it("encodes room codes that need escaping", () => {
    const link = buildRoomLink("a b/c");
    expect(link).toBe(`${window.location.origin}/classroom/a%20b%2Fc`);
  });
});
