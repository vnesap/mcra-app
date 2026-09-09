import { ClassroomRow } from "@/components/ClassroomRow";
import { SchedulerPanel } from "@/components/SchedulerPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useClassrooms } from "@/hooks/useClassrooms";
import { CalendarX2, ChevronDown } from "lucide-react";
import { useState } from "react";

const INITIAL_VISIBLE = 5;

/** Classroom Lobby — the default landing view. */
export function Lobby() {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const { data: classrooms = [], isLoading } = useClassrooms();

  const visibleRooms = classrooms.slice(0, visible);
  const hasMore = classrooms.length > visible;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Classroom Lobby
        </h1>
        <p className="mt-1 text-muted-foreground">
          Choose a scheduled math session to join, check who&apos;s online, and
          share a room link with your class.
        </p>
      </div>

      <div className="space-y-5">
        <SchedulerPanel />

        <section aria-label="Scheduled classrooms" data-ocid="lobby.list">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              All events
            </h2>
            <span className="text-sm text-muted-foreground">
              {classrooms.length} room{classrooms.length === 1 ? "" : "s"}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map(
                (id) => (
                  <div
                    key={id}
                    className="flex gap-4 rounded-2xl border bg-card p-5 shadow-subtle"
                  >
                    <Skeleton className="size-12 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                  </div>
                ),
              )}
            </div>
          ) : visibleRooms.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-12 text-center"
              data-ocid="lobby.empty_state"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <CalendarX2 className="size-7" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  No classrooms yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Schedule your first classroom above to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleRooms.map((classroom) => (
                <ClassroomRow
                  key={classroom.id.toString()}
                  classroom={classroom}
                />
              ))}

              {hasMore ? (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + INITIAL_VISIBLE)}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-5 py-2 text-sm font-medium text-foreground shadow-subtle transition-colors hover:bg-accent hover:text-accent-foreground"
                    data-ocid="lobby.show_more_button"
                  >
                    Show more
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
