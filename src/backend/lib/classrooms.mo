import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Types "../types/classrooms";

module {
  // Build a new Classroom record from its parts and append it to the list.
  public func createClassroom(
    classrooms : List.List<Types.Classroom>,
    id : Types.ClassroomId,
    owner : Principal,
    title : Text,
    duration : Types.ClassroomDuration,
    createdAt : Types.Timestamp,
    roomCode : Text,
  ) : Types.Classroom {
    let classroom = { id; owner; title; duration; createdAt; roomCode };
    classrooms.add(classroom);
    classroom
  };

  // Convert a classroom to its shared view, given its current online count.
  public func toView(classroom : Types.Classroom, onlineCount : Nat) : Types.ClassroomView {
    {
      id = classroom.id;
      title = classroom.title;
      duration = classroom.duration;
      createdAt = classroom.createdAt;
      roomCode = classroom.roomCode;
      onlineCount;
    };
  };

  // Return all classrooms in chronological order (oldest first) as views.
  public func listClassrooms(
    classrooms : List.List<Types.Classroom>,
    presence : List.List<Types.Presence>,
  ) : [Types.ClassroomView] {
    classrooms.toArray().map(func c = toView(c, onlineCount(presence, c.id)))
  };

  // Filter classrooms by a keyword (title match) and/or a date (createdAt day).
  public func searchClassrooms(
    classrooms : List.List<Types.Classroom>,
    presence : List.List<Types.Presence>,
    keyword : Text,
    date : ?Types.Timestamp,
  ) : [Types.ClassroomView] {
    let term = keyword.toLower();
    classrooms.toArray()
      .filter(func c =
        (term == "" or c.title.toLower().contains(#text term))
        and (switch date { case (?d) c.createdAt == d; case null true }))
      .map(func c = toView(c, onlineCount(presence, c.id)))
  };

  // Remove a classroom by id; returns true when it existed and was removed.
  public func deleteClassroom(classrooms : List.List<Types.Classroom>, id : Types.ClassroomId) : Bool {
    var removed = false;
    let snapshot = classrooms.toArray();
    classrooms.clear();
    for (c in snapshot.values()) {
      if (c.id == id) { removed := true } else { classrooms.add(c) };
    };
    removed
  };

  // Generate a unique room code for a classroom.
  public func generateRoomCode(id : Types.ClassroomId) : Text {
    "room-" # id.toText()
  };

  // Look up the room code for a classroom by id.
  public func getRoomCode(classrooms : List.List<Types.Classroom>, id : Types.ClassroomId) : ?Text {
    switch (classrooms.find(func c = c.id == id)) {
      case (?c) ?c.roomCode;
      case null null;
    };
  };

  // Find a classroom by its unique room code.
  public func findRoomByCode(classrooms : List.List<Types.Classroom>, roomCode : Text) : ?Types.Classroom {
    classrooms.find(func c = c.roomCode == roomCode)
  };

  // Mark a caller as online (true) or offline (false) in a room.
  public func setPresence(
    presence : List.List<Types.Presence>,
    roomId : Types.ClassroomId,
    caller : Principal,
    online : Bool,
  ) {
    switch (presence.find(func p = p.roomId == roomId)) {
      case (?p) {
        let updated = if (online) {
          if (p.online.contains(caller)) { p } else { { roomId = p.roomId; online = p.online.concat([caller]) } };
        } else {
          { roomId = p.roomId; online = p.online.filter(func x = x != caller) };
        };
        let snapshot = presence.toArray();
        presence.clear();
        for (x in snapshot.values()) {
          if (x.roomId == roomId) { presence.add(updated) } else { presence.add(x) };
        };
      };
      case null {
        if (online) { presence.add({ roomId; online = [caller] }) };
      };
    };
  };

  // Return the principals currently online in a room.
  public func getOnline(presence : List.List<Types.Presence>, roomId : Types.ClassroomId) : [Principal] {
    switch (presence.find(func p = p.roomId == roomId)) {
      case (?p) p.online;
      case null [];
    };
  };

  // Return the number of principals currently online in a room.
  public func onlineCount(presence : List.List<Types.Presence>, roomId : Types.ClassroomId) : Nat {
    getOnline(presence, roomId).size()
  };

  // Set the session-ended flag for a room.
  public func setSessionEnded(
    sessionEnded : List.List<Types.SessionEnded>,
    roomId : Types.ClassroomId,
    ended : Bool,
  ) {
    switch (sessionEnded.find(func s = s.roomId == roomId)) {
      case (?s) {
        let updated = { roomId = s.roomId; ended };
        let snapshot = sessionEnded.toArray();
        sessionEnded.clear();
        for (x in snapshot.values()) {
          if (x.roomId == roomId) { sessionEnded.add(updated) } else { sessionEnded.add(x) };
        };
      };
      case null {
        sessionEnded.add({ roomId; ended });
      };
    };
  };

  // Return whether a room's session has ended.
  public func getSessionEnded(sessionEnded : List.List<Types.SessionEnded>, roomId : Types.ClassroomId) : Bool {
    switch (sessionEnded.find(func s = s.roomId == roomId)) {
      case (?s) s.ended;
      case null false;
    };
  };
};
