import Common "common";

module {
  // An account's email address, used as the login identifier.
  public type Email = Text;

  // An account's password. Stored as plain text for the demo; registration
  // and password reset are out of scope.
  public type Password = Text;

  // A stored login account. The backend seeds a small set of demo accounts;
  // account registration is explicitly out of scope.
  public type Account = {
    email : Email;
    password : Password;
    name : Text;
    role : Common.Role;
  };

  // An active login session, keyed by a unique token.
  public type Session = {
    token : Text;
    email : Email;
    name : Text;
    role : Common.Role;
    createdAt : Common.Timestamp;
  };

  // Result of a login attempt.
  public type LoginResult = {
    #ok : Session;
    #invalidCredentials;
  };
};
