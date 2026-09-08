import { PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listClassrooms()).resolves.toEqual([]);
  await expect(actor.listChatMessages()).resolves.toEqual([]);
  await expect(actor.listReactions()).resolves.toEqual([]);
  await expect(actor.listWhiteboardActions()).resolves.toEqual([]);
});

it("round-trips a classroom through create/list/search/delete", async () => {
  const created = await actor.createClassroom("Adding Up Fun", { min30: null });
  expect(created.title).toBe("Adding Up Fun");
  expect(created.roomCode.length).toBeGreaterThan(0);

  const all = await actor.listClassrooms();
  expect(all).toHaveLength(1);
  expect(all[0]).toMatchObject({ id: created.id, title: "Adding Up Fun" });

  // Search by keyword finds the room.
  const byKeyword = await actor.searchClassrooms("Adding", []);
  expect(byKeyword).toHaveLength(1);
  expect(byKeyword[0].id).toBe(created.id);

  // Search by a date that does not match returns nothing.
  const byDate = await actor.searchClassrooms("", [created.createdAt + 1_000_000_000n]);
  expect(byDate).toEqual([]);

  // Room link resolves for the created classroom.
  const link = await actor.getRoomLink(created.id);
  expect(link).toEqual([created.roomCode]);

  // Deleting removes it from the lobby.
  await expect(actor.deleteClassroom(created.id)).resolves.toBe(true);
  await expect(actor.listClassrooms()).resolves.toEqual([]);
});

it("tracks presence through join and leave", async () => {
  const created = await actor.createClassroom("Presence", { hour1: null });
  await actor.joinRoom(created.roomCode);
  const online = await actor.getOnline(created.roomCode);
  expect(online.length).toBeGreaterThan(0);

  await actor.leaveRoom(created.roomCode);
  const after = await actor.getOnline(created.roomCode);
  expect(after).toEqual([]);
});

it("round-trips a chat message and a reaction", async () => {
  const id = await actor.sendChatMessage("Hello class", []);
  expect(id).toBeGreaterThan(0n);
  const messages = await actor.listChatMessages();
  expect(messages).toContainEqual(
    expect.objectContaining({ id, text: "Hello class", isSystem: false }),
  );

  const reactionId = await actor.sendReaction("👍");
  expect(reactionId).toBeGreaterThan(0n);
  const reactions = await actor.listReactions();
  expect(reactions).toContainEqual(
    expect.objectContaining({ id: reactionId, symbol: "👍" }),
  );
});

it("configures the timer and reports it running", async () => {
  await actor.setTimer(300n);
  const timer = await actor.getTimer();
  expect(timer.durationSec).toBe(300n);
  expect(timer.running).toBe(true);
});

it("broadcasts and lists whiteboard actions", async () => {
  await actor.broadcastWhiteboardAction("pen", [1, 2, 3, 4], "#6366f1", 4);
  const actions = await actor.listWhiteboardActions();
  expect(actions).toHaveLength(1);
  expect(actions[0]).toMatchObject({ kind: "pen", color: "#6366f1", width: 4 });
  expect(actions[0].points).toEqual([1, 2, 3, 4]);
});

it("sets and clears spotlight and sticker state", async () => {
  await actor.setSpotlight("Student 1");
  const spotlight = await actor.getSpotlight();
  expect(spotlight).toMatchObject({ active: true, studentName: "Student 1" });

  await actor.setSticker("Student 1", "⭐");
  const sticker = await actor.getSticker();
  expect(sticker).toMatchObject({ studentName: "Student 1", symbol: "⭐" });

  await actor.setSpotlight("");
  const cleared = await actor.getSpotlight();
  expect(cleared.active).toBe(false);
});

it("ends a session and reports it ended", async () => {
  const created = await actor.createClassroom("End me", { min30: null });
  await expect(actor.getSessionEnded(created.roomCode)).resolves.toBe(false);
  await actor.endSession(created.roomCode);
  await expect(actor.getSessionEnded(created.roomCode)).resolves.toBe(true);
});
