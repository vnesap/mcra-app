import type {
  ChatMessage,
  ClassroomId,
  ClassroomView,
  FileRef,
  ReactionEvent,
  SpotlightState,
  StickerState,
  TimerState,
  WhiteboardAction,
} from "@/backend";
import { ClassroomDuration } from "@/backend";

export { ClassroomDuration };
export type {
  ChatMessage,
  ClassroomId,
  ClassroomView,
  FileRef,
  ReactionEvent,
  SpotlightState,
  StickerState,
  TimerState,
  WhiteboardAction,
};

/** The role a participant picks when entering a live session. */
export type SessionRole = "teacher" | "student";

/** The current participant's identity for the session. */
export interface SessionUser {
  role: SessionRole;
  name: string;
}
