import { createClient } from '@supabase/supabase-js';
import { Room, RoomEvent, Track } from 'livekit-client';
import envConfig from '../env.json';

const supabaseUrl = envConfig.SUPABASE_URL;
const supabaseAnonKey = envConfig.SUPABASE_ANON_KEY;
const renderServerUrl = envConfig.RENDER_SERVER_URL;
const livekitUrl = envConfig.LIVEKIT_URL;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let activeLiveKitRoom: Room | null = null;

// Replicate Caffeine's native structural layouts
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

export class Backend {
    constructor(...args: any[]) {}

    /** Bypasses initial blockchain settings natively */
    async _initialize_access_control() { return; }
    async _internet_identity_sign_in_start() { return new Uint8Array(); }
    async _internet_identity_sign_in_finish() { return { __kind__: "ok" as const, ok: null }; }
    async getCallerUserRole() { return "admin" as UserRole; }
    async isCallerAdmin() { return true; }
    async getSessionEnded(roomCode: string) { return false; }

    /** 
     * LOGIN / AUTHENTICATION INTERCEPTS
     * Intercepts standard credentials to create an instant safe local session
     */
    async login(email: string, password: string) {
        const mockSession = {
            token: "session-" + Math.floor(Math.random() * 100000),
            name: email.split('@')[0],
            createdAt: BigInt(Date.now()),
            role: email.includes('student') ? Role.student : Role.teacher,
            email: email
        };
        return { __kind__: "ok" as const, ok: mockSession };
    }

    async getCurrentSession(token: string) {
        return null; // Signals template handlers to route cleanly to the modal defaults
    }

    async logout(token: string) { return; }

    /**
     * CLASSROOM ENGINE CREATION (SUPABASE LINKED)
     */
    async createClassroom(title: string, duration: ClassroomDuration) {
        try {
            const { data, error } = await supabase
                .from('mcra_classrooms')
                .insert([{ name: title, teacher_name: "Teacher", duration: duration, is_active: true }])
                .select()
                .single();

            if (error) throw error;
            
            return {
                id: BigInt(Math.floor(Math.random() * 1000000)),
                title: title,
                onlineCount: BigInt(0),
                duration: duration,
                createdAt: BigInt(Date.now()),
                roomCode: data.id // Returns the vital generated Supabase Room UUID string
            };
        } catch (err) {
            console.error("Supabase failed to register math classroom session row:", err);
            return null;
        }
    }
    /**
     * POPULATING THE LOBBY CONTAINER
     */
    async listClassrooms() {
        try {
            const { data } = await supabase.from('mcra_classrooms').select('*').order('created_at', { ascending: false });
            return (data || []).map(r => ({
                id: BigInt(Math.floor(Math.random() * 100000)),
                title: r.name,
                onlineCount: BigInt(0),
                duration: r.duration as ClassroomDuration,
                createdAt: BigInt(new Date(r.created_at).getTime()),
                roomCode: r.id
            }));
        } catch { return []; }
    }

    /**
     * LIVEKIT WEBRTC VIDEO SESSION CHANNEL CONNECTIONS
     */
    async joinRoom(roomCode: string) {
        try {
            const currentUserName = "User_" + Math.floor(Math.random() * 1000);
            
            const response = await fetch(`${renderServerUrl}/get-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomName: roomCode, participantName: currentUserName, isTeacher: true })
            });

            const { token } = await response.json();
            if (!token) throw new Error("Render token lookup returned empty array payload.");

            activeLiveKitRoom = new Room({ adaptiveStream: true, dynacast: true, reconnectAttempts: 10 });

            activeLiveKitRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === Track.Kind.Video) {
                    const videoContainer = document.getElementById("video-matrix-container");
                    if (videoContainer) {
                        const videoTag = track.attach();
                        videoTag.id = `vid-${participant.identity}`;
                        videoContainer.appendChild(videoTag);
                    }
                }
            });

            await activeLiveKitRoom.connect(livekitUrl, token);
            await activeLiveKitRoom.localParticipant.setCameraEnabled(true);
            await activeLiveKitRoom.localParticipant.setMicrophoneEnabled(true);
        } catch (videoError) {
            console.error("Video canvas layout initialization hit a hitch:", videoError);
        }
    }

    // Baseline placeholders matching structural framework endpoints to prevent crashes
    async listChatMessages() { return []; }
    async listWhiteboardActions() { return []; }
    async listReactions() { return []; }
    async leaveRoom(roomCode: string) { return; }
    async endSession(roomCode: string) { return; }
    async getSpotlight() { return { active: false, studentName: "" }; }
    async getSticker() { return { studentName: "", symbol: "" }; }
    async getTimer() { return { startTime: BigInt(0), durationSec: BigInt(0), running: false }; }
}

// BIND MODULAR OBJECT INSTANCES TO NATIVE CAFFEINE PLATFORM CONNECTORS:
const defaultBackendInstance = new Backend();
export const createActor = () => defaultBackendInstance;
export default defaultBackendInstance;
