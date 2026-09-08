import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoWindowProps {
  label: string;
  isTeacher: boolean;
  /** Video element ref for the local camera preview (teacher window). */
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  /** Emoji sticker affixed to this student's frame. */
  sticker?: string;
  className?: string;
}

/**
 * A single video window with a tiny name overlay in the corner and per-window
 * controls: mic mute, camera on/off, speaker volume, and mic sensitivity.
 * The teacher window hosts the local camera preview; student windows are
 * placeholder frames (no multi-party video).
 */
export function VideoWindow({
  label,
  isTeacher,
  videoRef,
  sticker,
  className,
}: VideoWindowProps) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [volume, setVolume] = useState(80);
  const [sensitivity, setSensitivity] = useState(60);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Apply mute / camera toggles to the local stream when this is the teacher
  // window hosting the camera preview.
  useEffect(() => {
    if (!videoRef?.current) return;
    const stream = videoRef.current.srcObject as MediaStream | null;
    if (!stream) return;
    for (const track of stream.getAudioTracks()) {
      track.enabled = !muted;
    }
    for (const track of stream.getVideoTracks()) {
      track.enabled = !cameraOff;
    }
  }, [muted, cameraOff, videoRef]);

  // Apply the volume slider to the local audio element.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-secondary/40 shadow-subtle",
        className,
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      data-ocid={
        isTeacher
          ? "classroom.video.teacher_window"
          : "classroom.video.student_window"
      }
    >
      {isTeacher && videoRef ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "size-full object-cover transition-opacity",
            cameraOff && "opacity-0",
          )}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/30 to-accent/20">
          <span className="flex size-16 items-center justify-center rounded-full bg-card text-3xl shadow-subtle">
            {label.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
      )}

      {cameraOff && isTeacher && videoRef ? (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/60">
          <span className="flex size-16 items-center justify-center rounded-full bg-card text-3xl shadow-subtle">
            {label.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
      ) : null}

      {/* Tiny name overlay in the corner */}
      <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
        {label}
        {isTeacher ? " · Teacher" : ""}
      </span>

      {/* Teacher-affixed sticker */}
      {sticker ? (
        <span
          className="absolute right-2 bottom-2 flex size-10 items-center justify-center rounded-full bg-white/80 text-2xl shadow-subtle"
          data-ocid="classroom.video.sticker"
        >
          {sticker}
        </span>
      ) : null}

      {/* Per-window controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 transition-opacity",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-white hover:bg-white/20"
          onClick={() => setMuted((v) => !v)}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          data-ocid="classroom.video.mic_toggle"
        >
          {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-white hover:bg-white/20"
          onClick={() => setCameraOff((v) => !v)}
          aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
          data-ocid="classroom.video.camera_toggle"
        >
          {cameraOff ? (
            <VideoOff className="size-4" />
          ) : (
            <Video className="size-4" />
          )}
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1">
          <Volume2 className="size-3.5 shrink-0 text-white/80" />
          <Slider
            value={[volume]}
            min={0}
            max={100}
            onValueChange={(v) => setVolume(v[0])}
            className="w-20"
            aria-label="Speaker volume"
            data-ocid="classroom.video.volume_slider"
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1">
          <Mic className="size-3.5 shrink-0 text-white/80" />
          <Slider
            value={[sensitivity]}
            min={0}
            max={100}
            onValueChange={(v) => setSensitivity(v[0])}
            className="w-20"
            aria-label="Mic sensitivity"
            data-ocid="classroom.video.sensitivity_slider"
          />
        </div>
      </div>

      {isTeacher && videoRef ? (
        <audio ref={audioRef} autoPlay>
          <track kind="captions" />
        </audio>
      ) : null}
    </div>
  );
}
