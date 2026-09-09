import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/auth";

module {
  // Find an account by email.
  public func findAccount(accounts : List.List<Types.Account>, email : Types.Email) : ?Types.Account {
    accounts.find(func a = a.email == email);
  };

  // Validate email/password against the stored accounts. Returns the matching
  // account on success, or null when the email is unknown or the password is
  // wrong.
  public func validateCredentials(
    accounts : List.List<Types.Account>,
    email : Types.Email,
    password : Types.Password,
  ) : ?Types.Account {
    switch (findAccount(accounts, email)) {
      case (?a) { if (a.password == password) { ?a } else { null } };
      case null null;
    };
  };

  // Create a new session for an account and store it. Returns the session.
  public func createSession(
    sessions : List.List<Types.Session>,
    nextSessionId : { var next : Nat },
    account : Types.Account,
  ) : Types.Session {
    let id = nextSessionId.next;
    nextSessionId.next += 1;
    let session : Types.Session = {
      token = "session-" # id.toText();
      email = account.email;
      name = account.name;
      role = account.role;
      createdAt = Time.now();
    };
    sessions.add(session);
    session
  };

  // Look up an active session by token.
  public func getSession(sessions : List.List<Types.Session>, token : Text) : ?Types.Session {
    sessions.find(func s = s.token == token);
  };

  // End (remove) a session by token. No-op if the token is unknown.
  public func endSession(sessions : List.List<Types.Session>, token : Text) : () {
    let snapshot = sessions.toArray();
    sessions.clear();
    for (s in snapshot.values()) {
      if (s.token != token) { sessions.add(s) };
    };
  };
};
