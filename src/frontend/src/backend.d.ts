import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StickerState {
    studentName: string;
    symbol: string;
}
export interface TimerState {
    startTime: bigint;
    durationSec: bigint;
    running: boolean;
}
export interface WhiteboardAction {
    id: bigint;
    kind: string;
    color: string;
    timestamp: bigint;
    senderName: string;
    width: number;
    points: Array<number>;
}
export type Timestamp = bigint;
export interface SpotlightState {
    active: boolean;
    studentName: string;
}
export interface ReactionEvent {
    id: bigint;
    timestamp: bigint;
    senderName: string;
    symbol: string;
}
export interface ClassroomView {
    id: ClassroomId;
    title: string;
    onlineCount: bigint;
    duration: ClassroomDuration;
    createdAt: Timestamp;
    roomCode: string;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface FileRef {
    url: string;
    name: string;
    size: bigint;
    mimeType: string;
}
export interface Session {
    token: string;
    name: string;
    createdAt: Timestamp;
    role: Role;
    email: Email;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Cell {
    value: Value;
    name: string;
}
export type Password = string;
export interface ChatMessage {
    id: bigint;
    file?: FileRef;
    isSystem: boolean;
    text: string;
    timestamp: bigint;
    senderName: string;
}
export type LoginResult = {
    __kind__: "ok";
    ok: Session;
} | {
    __kind__: "invalidCredentials";
    invalidCredentials: null;
};
export type ClassroomId = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type Email = string;
export enum ClassroomDuration {
    min30 = "min30",
    hour1 = "hour1",
    hour1half = "hour1half"
}
export enum Role {
    teacher = "teacher",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    broadcastWhiteboardAction(kind: string, points: Array<number>, color: string, width: number): Promise<void>;
    createClassroom(title: string, duration: ClassroomDuration): Promise<ClassroomView>;
    deleteClassroom(id: ClassroomId): Promise<boolean>;
    endSession(roomCode: string): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentSession(token: string): Promise<Session | null>;
    getOnline(roomCode: string): Promise<Array<Principal>>;
    getRoomLink(id: ClassroomId): Promise<string | null>;
    getSessionEnded(roomCode: string): Promise<boolean>;
    getSpotlight(): Promise<SpotlightState>;
    getSticker(): Promise<StickerState>;
    getTimer(): Promise<TimerState>;
    isCallerAdmin(): Promise<boolean>;
    joinRoom(roomCode: string): Promise<void>;
    leaveRoom(roomCode: string): Promise<void>;
    listChatMessages(): Promise<Array<ChatMessage>>;
    listClassrooms(): Promise<Array<ClassroomView>>;
    listReactions(): Promise<Array<ReactionEvent>>;
    listWhiteboardActions(): Promise<Array<WhiteboardAction>>;
    login(email: Email, password: Password): Promise<LoginResult>;
    logout(token: string): Promise<void>;
    schema(): Promise<string>;
    searchClassrooms(keyword: string, date: Timestamp | null): Promise<Array<ClassroomView>>;
    sendChatMessage(text: string, file: FileRef | null): Promise<bigint>;
    sendReaction(symbol: string): Promise<bigint>;
    setSpotlight(studentName: string): Promise<void>;
    setSticker(studentName: string, symbol: string): Promise<void>;
    setTimer(durationSec: bigint): Promise<void>;
}
