import { ClassroomDuration } from "@/lib/types";
import { vi } from "vitest";

/**
 * A typed mock of the backend actor returned by `useActor(createActor)`.
 * Components only read `actor` and `isFetching` from the hook, so the mock
 * supplies a full method surface backed by in-memory arrays.
 */
export interface MockActor {
  listClassrooms: ReturnType<typeof vi.fn>;
  searchClassrooms: ReturnType<typeof vi.fn>;
  createClassroom: ReturnType<typeof vi.fn>;
  deleteClassroom: ReturnType<typeof vi.fn>;
  getRoomLink: ReturnType<typeof vi.fn>;
  getOnline: ReturnType<typeof vi.fn>;
  joinRoom: ReturnType<typeof vi.fn>;
  leaveRoom: ReturnType<typeof vi.fn>;
  listChatMessages: ReturnType<typeof vi.fn>;
  sendChatMessage: ReturnType<typeof vi.fn>;
  listReactions: ReturnType<typeof vi.fn>;
  sendReaction: ReturnType<typeof vi.fn>;
  getTimer: ReturnType<typeof vi.fn>;
  setTimer: ReturnType<typeof vi.fn>;
  getSpotlight: ReturnType<typeof vi.fn>;
  setSpotlight: ReturnType<typeof vi.fn>;
  getSticker: ReturnType<typeof vi.fn>;
  setSticker: ReturnType<typeof vi.fn>;
  getSessionEnded: ReturnType<typeof vi.fn>;
  endSession: ReturnType<typeof vi.fn>;
  listWhiteboardActions: ReturnType<typeof vi.fn>;
  broadcastWhiteboardAction: ReturnType<typeof vi.fn>;
  login: ReturnType<typeof vi.fn>;
  getCurrentSession: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
}

/** Build a mock actor with every method stubbed to a vi.fn(). */
export function createMockActor(): MockActor {
  return {
    listClassrooms: vi.fn(),
    searchClassrooms: vi.fn(),
    createClassroom: vi.fn(),
    deleteClassroom: vi.fn(),
    getRoomLink: vi.fn(),
    getOnline: vi.fn(),
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    listChatMessages: vi.fn(),
    sendChatMessage: vi.fn(),
    listReactions: vi.fn(),
    sendReaction: vi.fn(),
    getTimer: vi.fn(),
    setTimer: vi.fn(),
    getSpotlight: vi.fn(),
    setSpotlight: vi.fn(),
    getSticker: vi.fn(),
    setSticker: vi.fn(),
    getSessionEnded: vi.fn(),
    endSession: vi.fn(),
    listWhiteboardActions: vi.fn(),
    broadcastWhiteboardAction: vi.fn(),
    login: vi.fn(),
    getCurrentSession: vi.fn(),
    logout: vi.fn(),
  };
}

/** A sample classroom view used across lobby tests. */
export function sampleClassroom(overrides: Record<string, unknown> = {}) {
  return {
    id: 1n,
    title: "Adding Up Fun",
    onlineCount: 0n,
    duration: ClassroomDuration.min30,
    createdAt: 1_700_000_000_000_000_000n,
    roomCode: "ABC123",
    ...overrides,
  };
}
