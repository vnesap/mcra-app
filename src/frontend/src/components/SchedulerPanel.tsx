import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateClassroom } from "@/hooks/useClassrooms";
import { ClassroomDuration } from "@/lib/types";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DURATION_OPTIONS: { value: ClassroomDuration; label: string }[] = [
  { value: ClassroomDuration.min30, label: "30 min" },
  { value: ClassroomDuration.hour1, label: "1 hr" },
  { value: ClassroomDuration.hour1half, label: "1½ hrs" },
];

/** Teacher panel to schedule a classroom with a title and duration. */
export function SchedulerPanel() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<ClassroomDuration>(
    ClassroomDuration.min30,
  );
  const createClassroom = useCreateClassroom();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTitle("");
    createClassroom.mutate(
      { title: trimmed, duration },
      {
        onSuccess: () => toast.success("Classroom scheduled!"),
        onError: () => {
          setTitle((current) => (current === "" ? trimmed : current));
          toast.error("Could not schedule the classroom");
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-5 shadow-subtle"
      data-ocid="lobby.scheduler_panel"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-sunny text-accent-foreground">
          <CalendarPlus className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Schedule a classroom
          </h2>
          <p className="text-sm text-muted-foreground">
            Set a title and pick how long the session runs.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="classroom-title">Classroom title</Label>
          <Input
            id="classroom-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Adding Up Fun!"
            data-ocid="lobby.title_input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classroom-duration">Duration</Label>
          <Select
            value={duration}
            onValueChange={(v) => setDuration(v as ClassroomDuration)}
          >
            <SelectTrigger
              id="classroom-duration"
              className="w-full sm:w-36"
              data-ocid="lobby.duration_select"
            >
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={title.trim() === "" || createClassroom.isPending}
          className="h-9"
          data-ocid="lobby.create_button"
        >
          {createClassroom.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CalendarPlus className="size-4" />
          )}
          {createClassroom.isPending ? "Scheduling…" : "Create room"}
        </Button>
      </div>
    </form>
  );
}
