import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionRole } from "@/lib/types";
import {
  Calculator as CalculatorIcon,
  DoorOpen,
  Download,
  MessageSquare,
  PanelRightClose,
  Presentation,
  Square,
  Timer,
  Upload,
  Users,
} from "lucide-react";
import { useRef } from "react";

interface HeaderBarProps {
  role: SessionRole | null;
  roomCode: string;
  whiteboardOpen: boolean;
  calculatorOpen: boolean;
  chatOpen: boolean;
  canDownload: boolean;
  uploading: boolean;
  onToggleWhiteboard: () => void;
  onToggleCalculator: () => void;
  onToggleChat: () => void;
  onOpenTimer: () => void;
  onOpenRoster: () => void;
  onUploadFile: (file: File) => void;
  onDownloadFile: () => void;
  onLeave: () => void;
  onEndSession: () => void;
}

/** Top tool bar for the live classroom: whiteboard, calculator, timer, chat,
 *  spotlight, leave, and end-session controls. */
export function HeaderBar({
  role,
  roomCode,
  whiteboardOpen,
  calculatorOpen,
  chatOpen,
  canDownload,
  uploading,
  onToggleWhiteboard,
  onToggleCalculator,
  onToggleChat,
  onOpenTimer,
  onOpenRoster,
  onUploadFile,
  onDownloadFile,
  onLeave,
  onEndSession,
}: HeaderBarProps) {
  const isTeacher = role === "teacher";
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onUploadFile(file);
    event.target.value = "";
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3 shadow-subtle">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
          <Presentation className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">
            Live Classroom
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Room {roomCode}
          </p>
        </div>
      </div>

      <Separator orientation="vertical" className="mx-1 h-8" />

      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={whiteboardOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={onToggleWhiteboard}
              data-ocid="classroom.header.whiteboard_toggle"
            >
              <Presentation className="size-4" />
              <span className="hidden sm:inline">Whiteboard</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle the shared whiteboard</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={calculatorOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={onToggleCalculator}
              data-ocid="classroom.header.calculator_toggle"
            >
              <CalculatorIcon className="size-4" />
              <span className="hidden sm:inline">Calculator</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open the scientific calculator</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              data-ocid="classroom.header.upload_button"
            >
              <Upload className="size-4" />
              <span className="hidden sm:inline">
                {uploading ? "Uploading…" : "Upload"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {uploading ? "Uploading file…" : "Attach a file to the class"}
          </TooltipContent>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handlePickFile}
          data-ocid="classroom.header.upload_input"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canDownload}
              onClick={onDownloadFile}
              data-ocid="classroom.header.download_button"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canDownload
              ? "Download the most recently uploaded file"
              : "No file uploaded yet"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenTimer}
              data-ocid="classroom.header.timer_button"
            >
              <Timer className="size-4" />
              <span className="hidden sm:inline">Timer</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Set the lesson countdown timer</TooltipContent>
        </Tooltip>

        {isTeacher ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onOpenRoster}
                data-ocid="classroom.header.roster_button"
              >
                <Users className="size-4" />
                <span className="hidden sm:inline">Spotlight</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Spotlight a student</TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={chatOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={onToggleChat}
              data-ocid="classroom.header.chat_toggle"
            >
              {chatOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <MessageSquare className="size-4" />
              )}
              <span className="hidden md:inline">Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {chatOpen ? "Hide chat" : "Show chat"}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-8" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLeave}
          data-ocid="classroom.header.leave_button"
        >
          <DoorOpen className="size-4" />
          <span className="hidden sm:inline">Leave</span>
        </Button>

        <Button
          type="button"
          variant={isTeacher ? "destructive" : "outline"}
          size="sm"
          disabled={!isTeacher}
          onClick={onEndSession}
          className={isTeacher ? "" : "text-muted-foreground"}
          data-ocid="classroom.header.end_session_button"
        >
          <Square className="size-4" />
          <span className="hidden sm:inline">End Session</span>
        </Button>
      </div>
    </header>
  );
}
