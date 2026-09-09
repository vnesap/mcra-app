/** Path segment that hosts a live classroom. */
const ROOM_PATH = "/classroom";

/**
 * Build a shareable room URL for a classroom from its room code. The link
 * lands directly on the live classroom page.
 */
export function buildRoomLink(roomCode: string): string {
  const base = window.location.origin;
  return `${base}${ROOM_PATH}/${encodeURIComponent(roomCode)}`;
}
