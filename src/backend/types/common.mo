import Principal "mo:core/Principal";

module {
  // A unique room code identifying a classroom; also embedded in share links.
  public type RoomCode = Text;

  // Nanoseconds since the Unix epoch, as returned by Time.now().
  public type Timestamp = Int;

  // The Internet Computer principal identifying a user.
  public type UserIdentity = Principal;

  // A user's display name.
  public type UserName = Text;

  // A user's role within a classroom.
  public type Role = {
    #teacher;
    #student;
  };
};
