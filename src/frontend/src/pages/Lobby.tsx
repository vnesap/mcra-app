import { ClassroomRow } from "@/components/ClassroomRow";
import { SchedulerPanel } from "@/components/SchedulerPanel";
import { SearchBar } from "@/components/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useClassrooms, useSearchClassrooms } from "@/hooks/useClassrooms";
import { CalendarX2, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

const INITIAL_VISIBLE = 5;

function dateToTimestamp(dateStr: string): bigint | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return BigInt(Date.UTC(y, m - 1, d)) * 1_000_000n;
}

/** Classroom Lobby — the default landing view. */
export function Lobby() {
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  const dateTs = useMemo(() => dateToTimestamp(date), [date]);
  const isSearching = keyword.trim() !== "" || dateTs !== null;

  const allClassrooms = useClassrooms();
  const searchClassrooms = useSearchClassrooms(
    keyword.trim(),
    isSearching ? dateTs : null,
  );

  const classrooms = isSearching ? searchClassrooms.data : allClassrooms.data;
  const isLoading = isSearching
    ? searchClassrooms.isLoading
    : allClassrooms.isLoading;

  const visibleRooms = classrooms?.slice(0, visible) ?? [];
  const hasMore = (classrooms?.length ?? 0) > visible;

  function handleClear() {
    setKeyword("");
    setDate("");
    setVisible(INITIAL_VISIBLE);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Classroom Lobby
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse scheduled math sessions, check who&apos;s online, and share a
          room link with your class.
        </p>
      </div>

      <div className="space-y-5">
        <SearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          date={date}
          onDateChange={setDate}
          onClear={handleClear}
        />

        <SchedulerPanel />

        <section aria-label="Scheduled classrooms" data-ocid="lobby.list">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              {isSearching ? "Search results" : "All events"}
            </h2>
            {isSearching ? (
              <span className="text-sm text-muted-foreground">
                {classrooms?.length ?? 0} found
              </span>
            ) : null}
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
                  {isSearching ? "No matching classrooms" : "No classrooms yet"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isSearching
                    ? "Try a different keyword or date."
                    : "Schedule your first classroom above to get started."}
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
