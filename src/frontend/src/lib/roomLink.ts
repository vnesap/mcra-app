/** Path segment that hosts the room entry gateway. */
const ROOM_PATH = "/join";

/**
 * Build a shareable room URL for a classroom from its room code. The link
 * lands on the room entry gateway, which prompts for role and name.
 */
export function buildRoomLink(roomCode: string): string {
  const base = window.location.origin;
  return `${base}${ROOM_PATH}/${encodeURIComponent(roomCode)}`;
}

/**
 * Extract the room code from a room link URL. Returns null when the URL is
 * not a valid room link.
 */
export function parseRoomCode(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments[0] === "join" && segments[1]) {
      return decodeURIComponent(segments[1]);
    }
    return null;
  } catch {
    return null;
  }
}

/** True when the given URL points at a room entry gateway link. */
export function isRoomLink(url: string): boolean {
  return parseRoomCode(url) !== null;
}
