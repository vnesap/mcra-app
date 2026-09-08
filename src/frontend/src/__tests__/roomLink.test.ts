import { buildRoomLink, isRoomLink, parseRoomCode } from "@/lib/roomLink";
import { describe, expect, it } from "vitest";

describe("roomLink", () => {
  it("builds a shareable room link from a room code", () => {
    const link = buildRoomLink("ABC123");
    expect(link).toBe(`${window.location.origin}/join/ABC123`);
  });

  it("encodes room codes that need escaping", () => {
    const link = buildRoomLink("a b/c");
    expect(link).toBe(`${window.location.origin}/join/a%20b%2Fc`);
  });

  it("parses a room code from a valid room link", () => {
    const link = buildRoomLink("ABC123");
    expect(parseRoomCode(link)).toBe("ABC123");
  });

  it("returns null for a non-room URL", () => {
    expect(parseRoomCode(`${window.location.origin}/lobby`)).toBeNull();
    expect(parseRoomCode("not a url")).toBeNull();
  });

  it("recognises room links and rejects others", () => {
    expect(isRoomLink(buildRoomLink("XYZ"))).toBe(true);
    expect(isRoomLink(`${window.location.origin}/`)).toBe(false);
  });
});
