import { createClient } from '@supabase/supabase-js';
import { Room, RoomEvent, Track } from 'livekit-client';

// 1. Fetch matching local config values from your env.json file
import envConfig from '../env.json';

const supabaseUrl = envConfig.SUPABASE_URL;
const supabaseAnonKey = envConfig.SUPABASE_ANON_KEY;
const renderServerUrl = envConfig.RENDER_SERVER_URL;
const livekitUrl = envConfig.LIVEKIT_URL;

// Initialize your operational database connection engine
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let activeLiveKitRoom: Room | null = null;

// Enums provided by Caffeine AI's template structures
export enum ClassroomDuration {
    min30 = "min30",
    hour1 = "hour1",
    hour1half = "hour1half"
}

export class Backend {
    constructor(...args: any[]) {}

    /**
     * INTERCEPT: Create classroom button trigger
     * Maps to your custom Supabase table setup
     */
    async createClassroom(title: string, duration: ClassroomDuration) {
        try {
            const { data, error } = await supabase
                .from('mcra_classrooms')
                .insert([
                    { 
                        name: title, 
                        teacher_name: "Teacher", // Default or bound username string
                        duration: duration,
                        is_active: true 
                    }
                ])
                .select();

            if (error) throw error;
            
            // Format output structure to safely prevent App.tsx from throwing errors
            return {
                id: data[0].id,
                title: title,
                duration: duration,
                createdAt: Date.now(),
                roomCode: data[0].id
            };
        } catch (err) {
            console.error("Database connection failure on classroom creation:", err);
            alert("Database tracking failed. Please double-check your Supabase credentials.");
            return null;
        }
    }

    /**
     * INTERCEPT: Join Classroom Room link gateway trigger
     * Automatically requests and spins up the live video call frame matrix
     */
    async joinRoom(roomCode: string) {
        try {
            const currentUserName = "User_" + Math.floor(Math.random() * 1000);
            
            const response = await fetch(`${renderServerUrl}/get-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: roomCode,
                    participantName: currentUserName,
                    isTeacher: true // Defaults privileges natively to test system features
                })
            });

            const { token } = await response.json();
            if (!token) throw new Error("Render token lookup matrix returned empty framework.");

            activeLiveKitRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
                reconnectAttempts: 10
            });

            activeLiveKitRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === Track.Kind.Video) {
                    const videoContainer = document.getElementById("video-matrix-container");
                    if (videoContainer) {
                        const videoTag = track.attach();
                        videoTag.id = `vid-${participant.identity}`;
                        videoTag.style.width = "200px"; // Preserves scaling parameters
                        videoContainer.appendChild(videoTag);
                    }
                }
            });

            await activeLiveKitRoom.connect(livekitUrl, token);
            await activeLiveKitRoom.localParticipant.setCameraEnabled(true);
            await activeLiveKitRoom.localParticipant.setMicrophoneEnabled(true);

            console.log("WebRTC framework running smoothly.");
        } catch (videoError) {
            console.error("Video layout setup failed:", videoError);
            alert("Video node failed to load. Ensure your Render web link config matches.");
        }
    }

    // Dummy matching class extensions to safely silence compiler framework errors
    async _initialize_access_control() {}
    async listClassrooms() { return []; }
    async listChatMessages() { return []; }
    async listWhiteboardActions() { return []; }
}
