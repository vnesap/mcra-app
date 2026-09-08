import List "mo:core/List";
import Principal "mo:core/Principal";
import Types "../types/collaboration";
import CollaborationLib "../lib/collaboration";

mixin (
  messages : List.List<Types.ChatMessage>,
  actions : List.List<Types.WhiteboardAction>,
  reactions : List.List<Types.ReactionEvent>,
  timer : { var state : Types.TimerState },
  spotlight : { var state : Types.SpotlightState },
  sticker : { var state : Types.StickerState },
  nextMessageId : { var next : Nat },
  nextActionId : { var next : Nat },
  nextReactionId : { var next : Nat },
) {
  // Send a chat message (optionally carrying a shared file) and return its id.
  public shared ({ caller }) func sendChatMessage(text : Text, file : ?Types.FileRef) : async Nat {
    CollaborationLib.sendChatMessage(messages, nextMessageId, caller.toText(), text, file)
  };

  // Return the full chat history.
  public query func listChatMessages() : async [Types.ChatMessage] {
    CollaborationLib.listChatMessages(messages)
  };

  // Broadcast a whiteboard action to all participants.
  public shared ({ caller }) func broadcastWhiteboardAction(
    kind : Text,
    points : [Float],
    color : Text,
    width : Float,
  ) : async () {
    CollaborationLib.broadcastWhiteboardAction(actions, nextActionId, caller.toText(), kind, points, color, width)
  };

  // Return the whiteboard action history.
  public query func listWhiteboardActions() : async [Types.WhiteboardAction] {
    CollaborationLib.listWhiteboardActions(actions)
  };

  // Set the teacher-configured countdown timer (synced to all users).
  public shared ({ caller }) func setTimer(durationSec : Nat) : async () {
    ignore caller;
    CollaborationLib.setTimer(timer, durationSec)
  };

  // Return the current countdown timer state.
  public query func getTimer() : async Types.TimerState {
    CollaborationLib.getTimer(timer)
  };

  // Spawn a floating reaction/sticker event over the classroom; returns its id.
  public shared ({ caller }) func sendReaction(symbol : Text) : async Nat {
    CollaborationLib.sendReaction(reactions, nextReactionId, caller.toText(), symbol)
  };

  // Return the recent reaction events.
  public query func listReactions() : async [Types.ReactionEvent] {
    CollaborationLib.listReactions(reactions)
  };

  // Set the teacher spotlight on a student (empty name clears it).
  public shared ({ caller }) func setSpotlight(studentName : Text) : async () {
    ignore caller;
    CollaborationLib.setSpotlight(spotlight, studentName)
  };

  // Return the current teacher spotlight state.
  public query func getSpotlight() : async Types.SpotlightState {
    CollaborationLib.getSpotlight(spotlight)
  };

  // Affix an emoji sticker onto a student's video frame.
  public shared ({ caller }) func setSticker(studentName : Text, symbol : Text) : async () {
    ignore caller;
    CollaborationLib.setSticker(sticker, studentName, symbol)
  };

  // Return the current sticker state.
  public query func getSticker() : async Types.StickerState {
    CollaborationLib.getSticker(sticker)
  };
};
