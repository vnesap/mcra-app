import List "mo:core/List";
import Types "../types/auth";
import AuthLib "../lib/auth";

mixin (
  accounts : List.List<Types.Account>,
  sessions : List.List<Types.Session>,
  nextSessionId : { var next : Nat },
) {
  // Validate email/password against the stored demo accounts and, on success,
  // create and return a new session. Returns #invalidCredentials when the
  // email is unknown or the password does not match.
  public shared func login(email : Types.Email, password : Types.Password) : async Types.LoginResult {
    switch (AuthLib.validateCredentials(accounts, email, password)) {
      case (?account) { #ok(AuthLib.createSession(sessions, nextSessionId, account)) };
      case null { #invalidCredentials };
    };
  };

  // Return the active session for a token, or null if it is not valid.
  public query func getCurrentSession(token : Text) : async ?Types.Session {
    AuthLib.getSession(sessions, token);
  };

  // End the session identified by token. No-op if the token is unknown.
  public shared func logout(token : Text) : async () {
    AuthLib.endSession(sessions, token);
  };
};
