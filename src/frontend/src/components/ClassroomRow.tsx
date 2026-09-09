import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteClassroom } from "@/hooks/useClassrooms";
import { useOnline } from "@/hooks/usePresence";
import { buildRoomLink } from "@/lib/roomLink";
import type { ClassroomDuration, ClassroomView } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Link2, LogIn, Trash2, User } from "lucide-react";
import { toast } from "sonner";

const SYMBOLS = ["+", "÷", "=", "×", "−", "π"];
const PASTELS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const DURATION_LABEL: Record<ClassroomDuration, string> = {
  min30: "30 min",
  hour1: "1 hr",
  hour1half: "1½ hrs",
};

function timestampToDate(ts: bigint): Date | null {
  const date = new Date(Number(ts / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A single classroom row anchored by a dated math symbol graphic. */
export function ClassroomRow({ classroom }: { classroom: ClassroomView }) {
  const { data: online = [] } = useOnline(classroom.roomCode);
  const deleteClassroom = useDeleteClassroom();
  const navigate = useNavigate();

  function handleJoin() {
    void navigate({
      to: "/classroom/$roomCode",
      params: { roomCode: classroom.roomCode },
    });
  }

  const idx = Number(classroom.id % BigInt(SYMBOLS.length));
  const symbol = SYMBOLS[idx];
  const pastel = PASTELS[idx % PASTELS.length];

  const date = timestampToDate(classroom.createdAt);
  const month = date ? MONTHS[date.getUTCMonth()] : "—";
  const day = date ? date.getUTCDate() : "—";

  const onlineCount = online.length;
  const isOnline = onlineCount > 0;
  const shownAvatars = Math.min(onlineCount, 3);
  const overflow = onlineCount - shownAvatars;

  function handleShare() {
    const link = buildRoomLink(classroom.roomCode);
    void navigator.clipboard.writeText(link).then(
      () => toast.success("Room link copied to clipboard"),
      () => toast.error("Could not copy the link"),
    );
  }

  return (
    <div
      className="relative flex gap-4 overflow-hidden rounded-2xl border bg-card p-5 shadow-subtle"
      data-ocid="lobby.row"
    >
      {/* organic pastel blob accent */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-10 size-28 rounded-full opacity-20 blur-2xl ${pastel}`}
      />

      {/* timeline rail: dated math symbol */}
      <div className="flex shrink-0 flex-col items-center">
        <div
          className={`flex size-12 items-center justify-center rounded-full ${pastel} font-display text-xl font-bold text-white shadow-subtle`}
        >
          {symbol}
        </div>
        <div className="mt-1.5 text-center leading-none">
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground">
            {month}
          </div>
          <div className="text-sm font-bold text-foreground">{day}</div>
        </div>
      </div>

      {/* center: title + metadata */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-display text-lg font-bold text-foreground">
            {classroom.title}
          </h3>
          {isOnline ? (
            <Badge
              variant="secondary"
              className="border-transparent bg-accent text-accent-foreground"
              data-ocid="lobby.online_badge"
            >
              <span className="size-1.5 rounded-full bg-accent-foreground" />
              Online
            </Badge>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {DURATION_LABEL[classroom.duration]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3.5" />
            {onlineCount} online
          </span>
        </div>
      </div>

      {/* right: presence + actions */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {Array.from({ length: shownAvatars }, (_, i) => `avatar-${i}`).map(
              (id) => (
                <Avatar key={id} className="size-7 border-2 border-card">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
              ),
            )}
            {overflow > 0 ? (
              <div className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground">
                +{overflow}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleJoin}
            className="bg-gradient-sunny font-bold text-foreground shadow-subtle hover:opacity-90"
            data-ocid="lobby.join_button"
          >
            <LogIn className="size-4" />
            Join
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleShare}
            data-ocid="lobby.share_button"
          >
            <Link2 className="size-4" />
            Share Room Link
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                data-ocid="lobby.delete_button"
                aria-label={`Delete ${classroom.title}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="lobby.delete_dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this classroom?</AlertDialogTitle>
                <AlertDialogDescription>
                  “{classroom.title}” will be removed from the lobby. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="lobby.delete_cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteClassroom.mutate(classroom.id, {
                      onSuccess: () => toast.success("Classroom deleted"),
                      onError: () =>
                        toast.error("Could not delete the classroom"),
                    })
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="lobby.delete_confirm_button"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
