module {
  public type ClassroomId = Nat;

  // Nanoseconds since the Unix epoch, as returned by Time.now().
  public type Timestamp = Int;

  public type ClassroomDuration = {
    #min30;
    #hour1;
    #hour1half;
  };

  public type Classroom = {
    id : ClassroomId;
    title : Text;
    duration : ClassroomDuration;
    createdAt : Timestamp;
    roomCode : Text;
    owner : Principal;
  };

  // Shared (Candid-safe) view of a classroom for the API boundary.
  public type ClassroomView = {
    id : ClassroomId;
    title : Text;
    duration : ClassroomDuration;
    createdAt : Timestamp;
    roomCode : Text;
    onlineCount : Nat;
  };

  // Presence state: which principals are currently online in a room.
  public type Presence = {
    roomId : ClassroomId;
    online : [Principal];
  };

  // Session-ended flag per room, polled by the frontend so ending a session
  // returns all participants to the lobby.
  public type SessionEnded = {
    roomId : ClassroomId;
    ended : Bool;
  };
};
