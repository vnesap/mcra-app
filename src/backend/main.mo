import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import ListEntity "mo:caffeineai-oql/ListEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import ClassroomsApi "mixins/classrooms-api";
import CollaborationApi "mixins/collaboration-api";
import AuthApi "mixins/auth-api";
import ApiDocMixin "mixins/api-doc";
import Types "types/collaboration";
import ClassroomsTypes "types/classrooms";
import AuthTypes "types/auth";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let classrooms : List.List<ClassroomsTypes.Classroom>;
  let presence : List.List<ClassroomsTypes.Presence>;
  let sessionEnded : List.List<ClassroomsTypes.SessionEnded>;
  let state : { var nextClassroomId : Nat };

  let messages : List.List<Types.ChatMessage>;
  let actions : List.List<Types.WhiteboardAction>;
  let reactions : List.List<Types.ReactionEvent>;
  let timer : { var state : Types.TimerState };
  let spotlight : { var state : Types.SpotlightState };
  let sticker : { var state : Types.StickerState };
  let nextMessageId : { var next : Nat };
  let nextActionId : { var next : Nat };
  let nextReactionId : { var next : Nat };

  let accounts : List.List<AuthTypes.Account>;
  let sessions : List.List<AuthTypes.Session>;
  let nextSessionId : { var next : Nat };

  include MixinAuthorization(accessControlState, null);

  // Sample owner principal used only to seed OQL schema discovery; the value
  // is ignored at query time.
  transient let anyP = Principal.fromText("aaaaa-aa");

  include Expose({
    entities = [
      classrooms.toEntityManual("classroom", "Classroom", "id")
        .sample({ id = 0; title = ""; duration = #min30; createdAt = 0; roomCode = ""; owner = anyP })
        .payload("id", func c = c.id)
        .payload("title", func c = c.title)
        .payload("duration", func c = switch (c.duration) {
          case (#min30) "min30";
          case (#hour1) "hour1";
          case (#hour1half) "hour1half";
        })
        .payload("createdAt", func c = c.createdAt)
        .payload("roomCode", func c = c.roomCode)
        .payload("owner", func c = c.owner)
        .public_()
        .build(),
      presence.toEntityManual("presence", "Presence", "roomId")
        .sample({ roomId = 0; online = [] })
        .payload("roomId", func p = p.roomId)
        .payload("onlineCount", func p = p.online.size())
        .controllerOnly()
        .build(),
      messages.toEntityManual("chatMessage", "ChatMessage", "id")
        .sample({ id = 0; senderName = ""; text = ""; timestamp = 0; isSystem = false; file = null })
        .payload("id", func m = m.id)
        .payload("senderName", func m = m.senderName)
        .payload("text", func m = m.text)
        .payload("timestamp", func m = m.timestamp)
        .payload("isSystem", func m = m.isSystem)
        .payload("fileName", func m = switch (m.file) { case (?f) f.name; case null "" })
        .controllerOnly()
        .build(),
      actions.toEntityManual("whiteboardAction", "WhiteboardAction", "id")
        .sample({ id = 0; senderName = ""; kind = ""; points = []; color = ""; width = 0.0; timestamp = 0 })
        .payload("id", func a = a.id)
        .payload("senderName", func a = a.senderName)
        .payload("kind", func a = a.kind)
        .payload("pointCount", func a = a.points.size())
        .payload("color", func a = a.color)
        .payload("width", func a = a.width)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),
      reactions.toEntity("reaction", "ReactionEvent", "id")
        .sample({ id = 0; senderName = ""; symbol = ""; timestamp = 0 })
        .controllerOnly()
        .build(),
      sessionEnded.toEntity("sessionEnded", "SessionEnded", "roomId")
        .sample({ roomId = 0; ended = false })
        .controllerOnly()
        .build(),
      // Auth tables. Both are sensitive: account passwords and session tokens
      // are never exposed as columns, and the tables are controller-only
      // (restricted) so no end user reads them directly.
      accounts.toEntityManual("account", "Account", "email")
        .sample({ email = ""; password = ""; name = ""; role = #teacher })
        .payload("email", func a = a.email)
        .payload("name", func a = a.name)
        .payload("role", func a = switch (a.role) {
          case (#teacher) "teacher";
          case (#student) "student";
        })
        .controllerOnly()
        .build(),
      sessions.toEntityManual("session", "Session", "token")
        .sample({ token = ""; email = ""; name = ""; role = #teacher; createdAt = 0 })
        .payload("token", func s = s.token)
        .payload("email", func s = s.email)
        .payload("name", func s = s.name)
        .payload("role", func s = switch (s.role) {
          case (#teacher) "teacher";
          case (#student) "student";
        })
        .payload("createdAt", func s = s.createdAt)
        .controllerOnly()
        .build(),
    ];
  });

  include ClassroomsApi(classrooms, presence, sessionEnded, state);

  include CollaborationApi(
    messages,
    actions,
    reactions,
    timer,
    spotlight,
    sticker,
    nextMessageId,
    nextActionId,
    nextReactionId,
  );

  include AuthApi(accounts, sessions, nextSessionId);

  include ApiDocMixin();
};
