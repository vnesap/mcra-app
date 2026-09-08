import { useReactions } from "@/hooks/useChat";
import type { ReactionEvent } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const FLOAT_DURATION_MS = 3000;

interface ActiveReaction {
  id: string;
  symbol: string;
  left: number;
  delay: number;
}

/**
 * Floating reactions and worded stickers that spawn a large animated icon over
 * the classroom for exactly 3 seconds before fading out.
 */
export function ReactionOverlay() {
  const { data: reactions = [] } = useReactions();
  const [active, setActive] = useState<ActiveReaction[]>([]);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const fresh = reactions.filter(
      (r) => !seenIds.current.has(r.id.toString()),
    );
    if (fresh.length === 0) return;

    const spawned: ActiveReaction[] = fresh.map((r: ReactionEvent) => ({
      id: r.id.toString(),
      symbol: r.symbol,
      left: 15 + Math.random() * 70,
      delay: Math.random() * 0.4,
    }));

    for (const r of spawned) seenIds.current.add(r.id);
    setActive((prev) => [...prev, ...spawned]);

    const timers = spawned.map((r) =>
      window.setTimeout(() => {
        setActive((prev) => prev.filter((x) => x.id !== r.id));
      }, FLOAT_DURATION_MS),
    );

    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [reactions]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
      aria-hidden
      data-ocid="classroom.reactions.overlay"
    >
      {active.map((r) => (
        <span
          key={r.id}
          className="animate-reaction-pop absolute text-6xl drop-shadow-lg"
          style={{ left: `${r.left}%`, animationDelay: `${r.delay}s` }}
        >
          {r.symbol}
        </span>
      ))}
    </div>
  );
}
