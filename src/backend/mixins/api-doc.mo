mixin () {
  public query func getApiDoc() : async Text {
    "# Interactive Math Classroom — Backend API

This backend powers a light-themed, child-friendly interactive math classroom. It
stores scheduled classrooms, per-room online presence, live chat messages,
whiteboard actions, floating reactions, and the teacher-controlled timer,
spotlight, and sticker state. It also exposes the queryable data through OQL
(`schema` / `execute`) and provides Internet Identity based role management.

## Public methods

### Classroom lobby (classrooms)

- `createClassroom(title : Text, duration : ClassroomDuration) : async ClassroomView`
  Schedules a new classroom. `duration` is one of `#min30` (30 min), `#hour1`
  (1 hr), or `#hour1half` (1½ hrs). Assigns an auto-incremented `id`, a unique
  `roomCode` of the form `room-<id>`, sets `owner` to the caller, and records
  `createdAt` as the current time. Returns the new classroom view with
  `onlineCount = 0`.
- `listClassrooms() : async [ClassroomView]`
  Returns all classrooms in chronological (insertion) order, each with its
  current `onlineCount`.
- `searchClassrooms(keyword : Text, date : ?Timestamp) : async [ClassroomView]`
  Filters classrooms by a case-insensitive `keyword` match on the title and/or
  by the calendar day of `date`. An empty `keyword` and `null` date match
  everything.
- `deleteClassroom(id : ClassroomId) : async Bool`
  Removes a classroom by id. Returns `true` if it existed and was removed,
  `false` otherwise. Does not remove that room's presence records.
- `getRoomLink(id : ClassroomId) : async ?Text`
  Returns the unique room URL `/join/<roomCode>` for the classroom, or `null`
  if no such classroom exists.
- `joinRoom(roomCode : Text) : async ()`
  Marks the caller as online in the room with the given code. No-op if the room
  code is unknown or the caller is already online.
- `leaveRoom(roomCode : Text) : async ()`
  Marks the caller as offline in the room with the given code. No-op if the
  room code is unknown or the caller is not online.
- `getOnline(roomCode : Text) : async [Principal]`
  Returns the principals currently online in the room, or `[]` if the room code
  is unknown.
- `endSession(roomCode : Text) : async ()`
  Ends the session for the room, setting its session-ended flag so all
  participants are returned to the lobby. No-op if the room code is unknown.
- `getSessionEnded(roomCode : Text) : async Bool`
  Returns whether the room's session has ended, or `false` if the room code is
  unknown.

### Live collaboration (collaboration)

- `sendChatMessage(text : Text, file : ?FileRef) : async Nat`
  Appends a chat message (optionally carrying a shared file) and returns its
  auto-incremented `id`. `isSystem` is always `false` for caller-sent messages.
- `listChatMessages() : async [ChatMessage]`
  Returns the full chat history in insertion order.
- `broadcastWhiteboardAction(kind : Text, points : [Float], color : Text, width : Float) : async ()`
  Appends a whiteboard action. `kind` is a tool name (e.g. `\"pen\"`, `\"line\"`,
  `\"rect\"`, `\"clear\"`); `points` carries the stroke coordinates; `color` and
  `width` style the stroke.
- `listWhiteboardActions() : async [WhiteboardAction]`
  Returns the full whiteboard action history in insertion order.
- `setTimer(durationSec : Nat) : async ()`
  Starts (or restarts) the teacher-configured countdown timer with the given
  duration, recording `startTime` as the current time and `running = true`.
- `getTimer() : async TimerState`
  Returns the current timer state (`durationSec`, `startTime`, `running`).
- `sendReaction(symbol : Text) : async Nat`
  Appends a floating reaction/sticker event and returns its auto-incremented
  `id`.
- `listReactions() : async [ReactionEvent]`
  Returns the recent reaction events in insertion order.
- `setSpotlight(studentName : Text) : async ()`
  Sets the teacher spotlight. A non-empty `studentName` sets `active = true`;
  an empty string clears it (`active = false`).
- `getSpotlight() : async SpotlightState`
  Returns the current spotlight state (`active`, `studentName`).
- `setSticker(studentName : Text, symbol : Text) : async ()`
  Affixes an emoji sticker onto a student's video frame. Only one sticker state
  is stored; the last write wins.
- `getSticker() : async StickerState`
  Returns the current sticker state (`studentName`, `symbol`).

### Authorization (Internet Identity)

- `_internet_identity_sign_in_start() : async Blob`
  Begins an Internet Identity sign-in and returns a challenge blob.
- `_internet_identity_sign_in_finish() : async Result<(), Verify.Error>`
  Completes the sign-in, registers the caller, and verifies the identity
  attributes.
- `_initialize_access_control() : async ()`
  Registers the caller in the role table (see Authentication below).
- `getCallerUserRole() : async UserRole`
  Returns the caller's role (`#admin`, `#user`, or `#guest`).
- `assignCallerUserRole(user : Principal, role : UserRole) : async ()`
  Assigns a role to another principal. Admin-only.
- `isCallerAdmin() : async Bool`
  Returns whether the caller is an admin.

### OQL data access

- `schema() : async ...`
  Returns the OQL schema describing the queryable entities.
- `execute(json : Text) : async ...`
  Runs a JSON OQL query over the exposed entities.

### API documentation

- `getApiDoc() : async Text`
  This document.

## Authentication and authorization

The app uses Internet Identity for authentication. The frontend pins an Internet
Identity derivation origin, published at `/.well-known/ii-derivation-origin`
when available. An agent already holding the user's Internet Identity
authorization derives the correct per-app principal against that origin, for
example `icp identity link web <name> --app <host>`. Such a delegation acts
with the user's full authority in this app until it expires.

Registration gates role-guarded access. A direct API caller must call
`_initialize_access_control` once as a signed-in (non-anonymous) caller before
any role-guarded call, guarded queries included. The first caller to register
becomes `#admin`; every subsequent caller becomes `#user`. Anonymous callers are
never registered (registration ignores them). An unregistered non-anonymous
caller receives a trap on `getCallerUserRole` and `isCallerAdmin` with the
message `\"User is not registered\"`. An anonymous caller receives `#guest` from
`getCallerUserRole` and `false` from `isCallerAdmin`.

A caller can be unregistered while the app already knows it because
registration happens only when a caller signs in through the app's own
frontend. A principal that never did so is unregistered even when it belongs to
the app's owner, and a signed-in caller derived against a different origin is a
different principal than the one the frontend registered.

`assignCallerUserRole` is admin-only; a non-admin caller traps with
`\"Unauthorized: Only admins can assign user roles\"`.

Note: the classroom and collaboration endpoints above do **not** enforce any
role check — they accept any caller, including anonymous callers. Only the
role-management endpoints above are gated.

## Units and encodings

- `ClassroomId` is a `Nat`.
- `Timestamp` (`createdAt`, `timestamp`, `startTime`) is an `Int` in
  nanoseconds since the Unix epoch, as returned by `Time.now()`.
- `roomCode` is a `Text` of the form `room-<id>`.
- `ClassroomDuration` is a variant: `#min30`, `#hour1`, `#hour1half`.
- `ClassroomView.onlineCount` is a `Nat` count of principals currently online.
- `WhiteboardAction.points` is `[Float]`; `kind` and `color` are `Text`;
  `width` is a `Float`.
- `ChatMessage.file` is an optional `FileRef { name; mimeType; size; url }`;
  `isSystem` is a `Bool` marking automated messages.
- `TimerState` is `{ durationSec : Nat; startTime : Int; running : Bool }`.
- `SpotlightState` is `{ active : Bool; studentName : Text }`.
- `StickerState` is `{ studentName : Text; symbol : Text }`.
- `ReactionEvent` is `{ id : Nat; senderName : Text; symbol : Text; timestamp : Int }`.

## Lifecycle and polling

- The countdown timer is configured with `setTimer(durationSec)` and read with
  `getTimer()`. The backend stores only the configured duration and start time;
  the countdown, the silent run, the final-3-seconds flash, and the
  text-to-speech `\"Time is up!\"` alert are rendered by the frontend. Poll
  `getTimer()` to observe the current state.
- The spotlight is toggled with `setSpotlight` (empty name clears it) and read
  with `getSpotlight()`.
- The sticker is set with `setSticker` and read with `getSticker()`; only the
  most recent sticker is retained.
- Reactions are appended with `sendReaction` and read with `listReactions()`.
- The teacher ends a session with `endSession(roomCode)`. Participants poll
  `getSessionEnded(roomCode)`; when it returns `true`, they leave the live
  session and return to the lobby.

## Mutation retry safety

- `createClassroom`, `sendChatMessage`, `sendReaction`, and
  `broadcastWhiteboardAction` each append a new record with a fresh
  auto-incremented id — retrying a call duplicates the record.
- `setTimer`, `setSpotlight`, and `setSticker` are idempotent overwrites (last
  write wins).
- `joinRoom` and `leaveRoom` are idempotent: adding an already-online caller or
  removing an absent caller is a no-op.
- `deleteClassroom` is idempotent: deleting a non-existent id returns `false`.

## Errors, traps, and gotchas

- `getCallerUserRole` and `isCallerAdmin` trap with `\"User is not registered\"`
  for an unregistered non-anonymous caller.
- `assignCallerUserRole` traps with
  `\"Unauthorized: Only admins can assign user roles\"` for a non-admin caller.
- `getRoomLink` returns `null` for an unknown id; `joinRoom`, `leaveRoom`,
  `getOnline`, `endSession`, and `getSessionEnded` silently no-op or return
  empty/false for an unknown room code.
- `listChatMessages`, `listWhiteboardActions`, and `listReactions` return the
  full, unbounded history.
- `deleteClassroom` does not clean up that room's presence records.
- OQL `schema()` / `execute()` expose the queryable entities with per-entity
  authorization: `classroom` is public (readable by anyone, including
  anonymous), while `presence`, `chatMessage`, `whiteboardAction`, and
  `reaction` are controller-only (readable by the platform controller, which
  is how the Data Intelligence agent answers questions over them)."
  };
};
