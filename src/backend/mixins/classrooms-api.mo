import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/classrooms";
import ClassroomsLib "../lib/classrooms";

mixin (
  classrooms : List.List<Types.Classroom>,
  presence : List.List<Types.Presence>,
  sessionEnded : List.List<Types.SessionEnded>,
  state : { var nextClassroomId : Nat },
) {
  // Schedule a new classroom with a custom title and duration.
  public shared ({ caller }) func createClassroom(
    title : Text,
    duration : Types.ClassroomDuration,
  ) : async Types.ClassroomView {
    let id = state.nextClassroomId;
    state.nextClassroomId += 1;
    let roomCode = ClassroomsLib.generateRoomCode(id);
    let classroom = ClassroomsLib.createClassroom(classrooms, id, caller, title, duration, Time.now(), roomCode);
    ClassroomsLib.toView(classroom, 0)
  };

  // List all classrooms in chronological order.
  public query func listClassrooms() : async [Types.ClassroomView] {
    ClassroomsLib.listClassrooms(classrooms, presence)
  };

  // Search/filter classrooms by keyword and/or date.
  public query func searchClassrooms(
    keyword : Text,
    date : ?Types.Timestamp,
  ) : async [Types.ClassroomView] {
    ClassroomsLib.searchClassrooms(classrooms, presence, keyword, date)
  };

  // Delete a classroom from the lobby.
  public shared ({ caller }) func deleteClassroom(id : Types.ClassroomId) : async Bool {
    ClassroomsLib.deleteClassroom(classrooms, id)
  };

  // Read the unique room link for a classroom.
  public query func getRoomLink(id : Types.ClassroomId) : async ?Text {
    switch (ClassroomsLib.getRoomCode(classrooms, id)) {
      case (?code) ?("/join/" # code);
      case null null;
    };
  };

  // Mark the caller as online in a room (entering the live session).
  public shared ({ caller }) func joinRoom(roomCode : Text) : async () {
    switch (ClassroomsLib.findRoomByCode(classrooms, roomCode)) {
      case (?c) { ClassroomsLib.setPresence(presence, c.id, caller, true) };
      case null {};
    };
  };

  // Mark the caller as offline in a room (leaving the live session).
  public shared ({ caller }) func leaveRoom(roomCode : Text) : async () {
    switch (ClassroomsLib.findRoomByCode(classrooms, roomCode)) {
      case (?c) { ClassroomsLib.setPresence(presence, c.id, caller, false) };
      case null {};
    };
  };

  // Return the principals currently online in a room.
  public query func getOnline(roomCode : Text) : async [Principal] {
    switch (ClassroomsLib.findRoomByCode(classrooms, roomCode)) {
      case (?c) ClassroomsLib.getOnline(presence, c.id);
      case null [];
    };
  };

  // End the session for a room, flagging it so all participants are returned
  // to the lobby when they poll getSessionEnded.
  public shared func endSession(roomCode : Text) : async () {
    switch (ClassroomsLib.findRoomByCode(classrooms, roomCode)) {
      case (?c) { ClassroomsLib.setSessionEnded(sessionEnded, c.id, true) };
      case null {};
    };
  };

  // Return whether a room's session has ended.
  public query func getSessionEnded(roomCode : Text) : async Bool {
    switch (ClassroomsLib.findRoomByCode(classrooms, roomCode)) {
      case (?c) ClassroomsLib.getSessionEnded(sessionEnded, c.id);
      case null false;
    };
  };
};
