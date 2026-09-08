import { VideoWindow } from "@/components/classroom/VideoWindow";
import { Button } from "@/components/ui/button";
import type { SpotlightState, StickerState } from "@/lib/types";
import type { SessionRole } from "@/lib/types";
import type { Principal } from "@icp-sdk/core/principal";
import { Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoLayoutProps {
  role: SessionRole | null;
  name: string;
  online: Principal[];
  spotlight: SpotlightState;
  sticker: StickerState;
  onOpenRoster: () => void;
}

/** Build a stable display label for an online participant. */
function participantLabel(index: number): string {
  return `Student ${index + 1}`;
}

/**
 * Video layout: teacher feed large in the center, student feeds in a smaller
 * horizontal row at the bottom. Uses the local camera preview (no multi-party
 * video). Teacher Spotlight forces a 50/50 side-by-side split.
 */
export function VideoLayout({
  role,
  name,
  online,
  spotlight,
  sticker,
  onOpenRoster,
}: VideoLayoutProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);

  // Start the local camera preview on mount.
  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      } catch {
        setCameraError(true);
      }
    }
    void start();
    return () => {
      cancelled = true;
      if (stream) {
        for (const t of stream.getTracks()) t.stop();
      }
    };
  }, []);

  const teacherLabel = role === "teacher" && name ? name : "Teacher";
  const spotlightActive = spotlight.active && spotlight.studentName;

  // Student windows: online participants, excluding the teacher's own window.
  const studentCount = Math.max(online.length, 2);
  const students = Array.from({ length: studentCount }, (_, i) =>
    participantLabel(i),
  );

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {spotlightActive ? (
        /* 50/50 side-by-side split: teacher left, student right */
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
          <VideoWindow
            label={teacherLabel}
            isTeacher
            videoRef={videoRef}
            className="h-full"
          />
          <VideoWindow
            label={spotlight.studentName}
            isTeacher={false}
            sticker={
              sticker.studentName === spotlight.studentName
                ? sticker.symbol
                : undefined
            }
            className="h-full"
          />
        </div>
      ) : (
        <>
          {/* Teacher feed large in the center */}
          <div className="min-h-0 flex-1">
            <VideoWindow
              label={teacherLabel}
              isTeacher
              videoRef={videoRef}
              className="h-full"
            />
          </div>

          {/* Student feeds in a smaller horizontal row at the bottom */}
          <div className="flex h-32 shrink-0 gap-3 overflow-x-auto">
            {students.map((label) => (
              <VideoWindow
                key={label}
                label={label}
                isTeacher={false}
                sticker={
                  sticker.studentName === label ? sticker.symbol : undefined
                }
                className="h-full w-48 shrink-0"
              />
            ))}
          </div>
        </>
      )}

      {cameraError ? (
        <div
          className="absolute inset-x-0 bottom-16 mx-auto w-fit rounded-full bg-destructive/90 px-4 py-1.5 text-sm font-medium text-white shadow-subtle"
          data-ocid="classroom.video.camera_error"
        >
          Camera unavailable — showing placeholder preview
        </div>
      ) : null}

      {role === "teacher" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenRoster}
          className="absolute top-3 right-3"
          data-ocid="classroom.video.open_roster_button"
        >
          <Users className="size-4" />
          Spotlight
        </Button>
      ) : null}
    </div>
  );
}
