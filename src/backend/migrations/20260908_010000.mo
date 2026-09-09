import List "mo:core/List";
import Map "mo:core/Map";
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

  type Role = {
    #teacher;
    #student;
  };

  type Account = {
    email : Text;
    password : Text;
    name : Text;
    role : Role;
  };

  type Session = {
    token : Text;
    email : Text;
    name : Text;
    role : Role;
    createdAt : Int;
  };

  type OldActor = {
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
    accounts : List.List<Account>;
    sessions : List.List<Session>;
    nextSessionId : { var next : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      messages = old.messages;
      actions = old.actions;
      reactions = old.reactions;
      timer = old.timer;
      spotlight = old.spotlight;
      sticker = old.sticker;
      nextMessageId = old.nextMessageId;
      nextActionId = old.nextActionId;
      nextReactionId = old.nextReactionId;
      classrooms = old.classrooms;
      presence = old.presence;
      sessionEnded = old.sessionEnded;
      state = old.state;
      accounts = List.fromArray([
        { email = "teacher@classroom.app"; password = "teacher123"; name = "Ms. Rivera"; role = #teacher },
        { email = "student@classroom.app"; password = "student123"; name = "Alex"; role = #student },
      ]);
      sessions = List.empty();
      nextSessionId = { var next = 0 };
    };
  };
};
