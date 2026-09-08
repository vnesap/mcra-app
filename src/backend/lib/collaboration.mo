import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/collaboration";

module {
  // Appends a chat message and returns its id.
  public func sendChatMessage(
    messages : List.List<Types.ChatMessage>,
    nextId : { var next : Nat },
    senderName : Text,
    text : Text,
    file : ?Types.FileRef,
  ) : Nat {
    let id = nextId.next;
    nextId.next += 1;
    messages.add({
      id;
      senderName;
      text;
      timestamp = Time.now();
      isSystem = false;
      file;
    });
    id
  };

  // Returns the full chat history.
  public func listChatMessages(messages : List.List<Types.ChatMessage>) : [Types.ChatMessage] {
    messages.toArray()
  };

  // Broadcasts a whiteboard action to all participants.
  public func broadcastWhiteboardAction(
    actions : List.List<Types.WhiteboardAction>,
    nextId : { var next : Nat },
    senderName : Text,
    kind : Text,
    points : [Float],
    color : Text,
    width : Float,
  ) {
    let id = nextId.next;
    nextId.next += 1;
    actions.add({
      id;
      senderName;
      kind;
      points;
      color;
      width;
      timestamp = Time.now();
    });
  };

  // Returns the whiteboard action history.
  public func listWhiteboardActions(actions : List.List<Types.WhiteboardAction>) : [Types.WhiteboardAction] {
    actions.toArray()
  };

  // Sets or updates the teacher-configured countdown timer.
  public func setTimer(timer : { var state : Types.TimerState }, durationSec : Nat) {
    timer.state := {
      durationSec;
      startTime = Time.now();
      running = true;
    };
  };

  // Returns the current countdown timer state.
  public func getTimer(timer : { var state : Types.TimerState }) : Types.TimerState {
    timer.state
  };

  // Spawns a floating reaction/sticker event over the classroom.
  public func sendReaction(
    events : List.List<Types.ReactionEvent>,
    nextId : { var next : Nat },
    senderName : Text,
    symbol : Text,
  ) : Nat {
    let id = nextId.next;
    nextId.next += 1;
    events.add({
      id;
      senderName;
      symbol;
      timestamp = Time.now();
    });
    id
  };

  // Returns the recent reaction events.
  public func listReactions(events : List.List<Types.ReactionEvent>) : [Types.ReactionEvent] {
    events.toArray()
  };

  // Sets the teacher spotlight on a student (or clears it).
  public func setSpotlight(spotlight : { var state : Types.SpotlightState }, studentName : Text) {
    spotlight.state := {
      active = studentName != "";
      studentName;
    };
  };

  // Returns the current teacher spotlight state.
  public func getSpotlight(spotlight : { var state : Types.SpotlightState }) : Types.SpotlightState {
    spotlight.state
  };

  // Affixes an emoji sticker onto a student's video frame.
  public func setSticker(sticker : { var state : Types.StickerState }, studentName : Text, symbol : Text) {
    sticker.state := { studentName; symbol };
  };

  // Returns the current sticker state.
  public func getSticker(sticker : { var state : Types.StickerState }) : Types.StickerState {
    sticker.state
  };
};
