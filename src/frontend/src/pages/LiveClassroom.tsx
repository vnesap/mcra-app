import { createActor } from "@/backend";
import { Calculator } from "@/components/classroom/Calculator";
import { ChatSidebar } from "@/components/classroom/ChatSidebar";
import { HeaderBar } from "@/components/classroom/HeaderBar";
import { ReactionOverlay } from "@/components/classroom/ReactionOverlay";
import { SpotlightRoster } from "@/components/classroom/SpotlightRoster";
import { TimerOverlay } from "@/components/classroom/TimerOverlay";
import { VideoLayout } from "@/components/classroom/VideoLayout";
import { Whiteboard } from "@/components/classroom/Whiteboard";
import { useJoinRoom, useLeaveRoom, useOnline } from "@/hooks/usePresence";
import { useSessionStore } from "@/store/session";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/** Poll the teacher's spotlight state for the whole class. */
function useSpotlight() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["spotlight"],
    queryFn: async () => {
      if (!actor) return { active: false, studentName: "" };
      return actor.getSpotlight();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

/** Poll the teacher's affixed sticker state for the whole class. */
function useSticker() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sticker"],
    queryFn: async () => {
      if (!actor) return { studentName: "", symbol: "" };
      return actor.getSticker();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

/** Poll whether the teacher has ended the session for the whole class. */
function useSessionEnded(roomCode: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sessionEnded", roomCode],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getSessionEnded(roomCode);
    },
    enabled: !!actor && !isFetching && !!roomCode,
    refetchInterval: 3000,
  });
}

/**
 * Live Virtual Classroom — the collaboration hub. Renders the tool header,
 * the video layout, the collapsible chat sidebar, and the floating overlays
 * (whiteboard, calculator, timer, reactions, spotlight roster).
 */
export function LiveClassroom() {
  const { roomCode } = useParams({ from: "/classroom/$roomCode" });
  const navigate = useNavigate();
  const role = useSessionStore((s) => s.role);
  const name = useSessionStore((s) => s.name);
  const { actor } = useActor(createActor);

  const joinRoom = useJoinRoom();
  const leaveRoom = useLeaveRoom();
  const { data: online = [] } = useOnline(roomCode);
  const { data: spotlight } = useSpotlight();
  const { data: sticker } = useSticker();
  const { data: sessionEnded = false } = useSessionEnded(roomCode);

  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [rosterOpen, setRosterOpen] = useState(false);

  // Join the room on mount so the participant appears in the presence list.
  useEffect(() => {
    if (roomCode) {
      joinRoom.mutate(roomCode);
    }
  }, [roomCode, joinRoom]);

  // When the teacher ends the session, return everyone to the lobby.
  useEffect(() => {
    if (sessionEnded && roomCode) {
      leaveRoom.mutate(roomCode);
      void navigate({ to: "/" });
    }
  }, [sessionEnded, roomCode, leaveRoom, navigate]);

  function handleLeave() {
    if (roomCode) leaveRoom.mutate(roomCode);
    void navigate({ to: "/" });
  }

  function handleEndSession() {
    if (role !== "teacher") return;
    if (roomCode && actor) {
      void actor.endSession(roomCode);
    }
    if (roomCode) leaveRoom.mutate(roomCode);
    void navigate({ to: "/" });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      <HeaderBar
        role={role}
        roomCode={roomCode}
        whiteboardOpen={whiteboardOpen}
        calculatorOpen={calculatorOpen}
        chatOpen={chatOpen}
        onToggleWhiteboard={() => setWhiteboardOpen((v) => !v)}
        onToggleCalculator={() => setCalculatorOpen((v) => !v)}
        onToggleChat={() => setChatOpen((v) => !v)}
        onOpenTimer={() => setTimerOpen(true)}
        onOpenRoster={() => setRosterOpen(true)}
        onLeave={handleLeave}
        onEndSession={handleEndSession}
      />

      <div className="flex min-h-0 flex-1">
        {/* Main classroom area */}
        <div className="relative min-w-0 flex-1">
          <VideoLayout
            role={role}
            name={name}
            online={online}
            spotlight={spotlight ?? { active: false, studentName: "" }}
            sticker={sticker ?? { studentName: "", symbol: "" }}
            onOpenRoster={() => setRosterOpen(true)}
          />

          {whiteboardOpen ? (
            <Whiteboard onClose={() => setWhiteboardOpen(false)} />
          ) : null}

          {calculatorOpen ? (
            <Calculator onClose={() => setCalculatorOpen(false)} />
          ) : null}

          <TimerOverlay
            open={timerOpen}
            onClose={() => setTimerOpen(false)}
            isTeacher={role === "teacher"}
          />

          <ReactionOverlay />
        </div>

        {/* Collapsible right chat sidebar, capped at 1/3 screen width */}
        {chatOpen ? (
          <ChatSidebar
            className="w-full max-w-[33vw] shrink-0 border-l bg-card"
            onClose={() => setChatOpen(false)}
          />
        ) : null}
      </div>

      {rosterOpen ? (
        <SpotlightRoster
          online={online}
          currentName={name}
          role={role}
          onClose={() => setRosterOpen(false)}
        />
      ) : null}
    </div>
  );
}
