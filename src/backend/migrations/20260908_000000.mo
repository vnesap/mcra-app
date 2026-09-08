import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type FileRef = {
    name : Text;
    mimeType : Text;
    size : Nat;
    url : Text;
  };

  type ChatMessage = {
    id : Nat;
    senderName : Text;
    text : Text;
    timestamp : Int;
    isSystem : Bool;
    file : ?FileRef;
  };

  type WhiteboardAction = {
    id : Nat;
    senderName : Text;
    kind : Text;
    points : [Float];
    color : Text;
    width : Float;
    timestamp : Int;
  };

  type TimerState = {
    durationSec : Nat;
    startTime : Int;
    running : Bool;
  };

  type ReactionEvent = {
    id : Nat;
    senderName : Text;
    symbol : Text;
    timestamp : Int;
  };

  type SpotlightState = {
    active : Bool;
    studentName : Text;
  };

  type StickerState = {
    studentName : Text;
    symbol : Text;
  };

  type ClassroomDuration = {
    #min30;
    #hour1;
    #hour1half;
  };

  type Classroom = {
    id : Nat;
    title : Text;
    duration : ClassroomDuration;
    createdAt : Int;
    roomCode : Text;
    owner : Principal;
  };

  type Presence = {
    roomId : Nat;
    online : [Principal];
  };

  type SessionEnded = {
    roomId : Nat;
    ended : Bool;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControlState;
    messages : List.List<ChatMessage>;
    actions : List.List<WhiteboardAction>;
    reactions : List.List<ReactionEvent>;
    timer : { var state : TimerState };
    spotlight : { var state : SpotlightState };
    sticker : { var state : StickerState };
    nextMessageId : { var next : Nat };
    nextActionId : { var next : Nat };
    nextReactionId : { var next : Nat };
    classrooms : List.List<Classroom>;
    presence : List.List<Presence>;
    sessionEnded : List.List<SessionEnded>;
    state : { var nextClassroomId : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
      messages = List.empty();
      actions = List.empty();
      reactions = List.empty();
      timer = { var state = { durationSec = 0; startTime = 0; running = false } };
      spotlight = { var state = { active = false; studentName = "" } };
      sticker = { var state = { studentName = ""; symbol = "" } };
      nextMessageId = { var next = 0 };
      nextActionId = { var next = 0 };
      nextReactionId = { var next = 0 };
      classrooms = List.empty();
      presence = List.empty();
      sessionEnded = List.empty();
      state = { var nextClassroomId = 0 };
    };
  };
};
