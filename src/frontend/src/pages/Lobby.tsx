import { createClient } from '@supabase/supabase-js';
import { ClassroomRow } from "@/components/ClassroomRow";
import { SchedulerPanel } from "@/components/SchedulerPanel";
import { SearchBar } from "@/components/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import envConfig from '../env.json';

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_ANON_KEY);
const INITIAL_VISIBLE = 5;

/** Classroom Lobby — the default landing view. */
export function Lobby() {
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch your live math classrooms directly from your active Supabase DB
  useEffect(() => {
    async function fetchClassrooms() {
      try {
        setIsLoading(true);
        let query = supabase.from('mcra_classrooms').select('*').order('created_at', { ascending: false });
        
        if (keyword.trim()) {
          query = query.ilike('name', `%${keyword}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        // Map database schemas to safely match your original UI Row attributes
        const formattedRooms = (data || []).map(room => ({
          id: room.id,
          title: room.name,
          duration: room.duration,
          createdAt: new Date(room.created_at).getTime(),
          roomCode: room.id,
          onlineCount: 0
        }));

        setClassrooms(formattedRooms);
      } catch (err) {
        console.error("Supabase failed to populate lobby entries:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClassrooms();

    // Setup an active WebSocket channel listener to update list instantly when rooms are added/deleted
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mcra_classrooms' }, () => {
        fetchClassrooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [keyword, date]);

  function handleClear() {
    setKeyword("");
    setDate("");
    setVisible(INITIAL_VISIBLE);
  }

  const visibleRooms = classrooms.slice(0, visible);
  const hasMore = classrooms.length > visible;

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
              {keyword ? "Search results" : "All events"}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((id) => (
                <div key={id} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-subtle">
                  <Skeleton className="size-12 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : visibleRooms.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <CalendarX2 className="size-7" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {keyword ? "No matching classrooms" : "No classrooms yet"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {keyword ? "Try a different keyword." : "Schedule your first classroom above to get started."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleRooms.map((classroom) => (
                <ClassroomRow key={classroom.id.toString()} classroom={classroom} />
              ))}

              {hasMore ? (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + INITIAL_VISIBLE)}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-5 py-2 text-sm font-medium text-foreground shadow-subtle transition-colors hover:bg-accent hover:text-accent-foreground"
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
