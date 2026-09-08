module {
  // A reference to a file shared through the classroom chat.
  public type FileRef = {
    name : Text;
    mimeType : Text;
    size : Nat;
    url : Text;
  };

  // A chat message. `isSystem` is true for automated messages (e.g. a student
  // raised their hand, a teacher posted a file); `file` is present when the
  // message carries a shared file.
  public type ChatMessage = {
    id : Nat;
    senderName : Text;
    text : Text;
    timestamp : Int;
    isSystem : Bool;
    file : ?FileRef;
  };

  // A single whiteboard action broadcast to all participants. `kind` selects
  // the tool (e.g. "pen", "line", "rect", "clear"); `points` carries the
  // stroke coordinates; `color` and `width` style the stroke.
  public type WhiteboardAction = {
    id : Nat;
    senderName : Text;
    kind : Text;
    points : [Float];
    color : Text;
    width : Float;
    timestamp : Int;
  };

  // The teacher-configured countdown timer, synced to all users.
  public type TimerState = {
    durationSec : Nat;
    startTime : Int;
    running : Bool;
  };

  // A floating reaction/sticker event spawned over the classroom.
  public type ReactionEvent = {
    id : Nat;
    senderName : Text;
    symbol : Text;
    timestamp : Int;
  };

  // Teacher spotlight: forces a 50/50 side-by-side split with the named
  // student until toggled off. `active` is false when no spotlight is set.
  public type SpotlightState = {
    active : Bool;
    studentName : Text;
  };

  // A teacher-affixed emoji sticker on a specific student's video frame.
  public type StickerState = {
    studentName : Text;
    symbol : Text;
  };
};
