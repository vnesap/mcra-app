import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  Eraser,
  Maximize2,
  Minimize2,
  Pen,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
  "#111827",
];

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: "pen" | "erase";
}

/** Poll the shared whiteboard action history. */
function useWhiteboardActions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["whiteboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listWhiteboardActions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

/** Convert a flat [x, y, x, y, ...] array into point objects. */
function chunkPoints(flat: number[]): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    points.push({ x: flat[i], y: flat[i + 1] });
  }
  return points;
}

interface WhiteboardProps {
  onClose: () => void;
}

/**
 * Vector whiteboard with a mathematical grid, drawing tools (pen, color,
 * width, erase), a full/half-screen toggle, and a Screenshot button that
 * renders and downloads the drawing as an image. Strokes can be broadcast to
 * the whole class in shared mode.
 */
export function Whiteboard({ onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  // Ids of remote actions already merged onto the canvas (avoids re-drawing).
  const appliedActionIdsRef = useRef<Set<bigint>>(new Set());
  // Flat point arrays of strokes the local user broadcast but whose echo from
  // listWhiteboardActions has not arrived yet. Used to skip our own broadcast
  // so it is not drawn twice.
  const pendingLocalRef = useRef<number[][]>([]);

  const [tool, setTool] = useState<"pen" | "erase">("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(4);
  const [fullScreen, setFullScreen] = useState(false);
  const [shared, setShared] = useState(false);
  const { data: remoteActions = [] } = useWhiteboardActions();

  const { actor } = useActor(createActor);

  // Draw the grid + all strokes (local and remote) onto the canvas.
  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Mathematical grid
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "oklch(0.985 0.012 90)";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = "oklch(0.9 0.02 90)";
    ctx.lineWidth = 1;
    const grid = 32;
    for (let x = 0; x <= rect.width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y <= rect.height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
    // Axis emphasis
    ctx.strokeStyle = "oklch(0.8 0.02 90)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rect.width / 2, 0);
    ctx.lineTo(rect.width / 2, rect.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();

    // Draw strokes
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
  }, []);

  // Redraw whenever the panel toggles between full/half screen.
  useEffect(() => {
    // Re-run when the panel resizes between full/half screen.
    void fullScreen;
    drawAll();
  }, [drawAll, fullScreen]);

  // Replay remote actions fetched via listWhiteboardActions onto the canvas so
  // all participants see each other's drawings. Skips the local user's own
  // broadcast echo to avoid double-drawing.
  useEffect(() => {
    if (!shared) return;
    let changed = false;
    for (const action of remoteActions) {
      if (appliedActionIdsRef.current.has(action.id)) continue;
      appliedActionIdsRef.current.add(action.id);
      if (action.kind === "clear") {
        strokesRef.current = [];
        pendingLocalRef.current = [];
        changed = true;
        continue;
      }
      // Skip our own broadcast echo (already drawn locally).
      const echoIdx = pendingLocalRef.current.findIndex(
        (p) =>
          p.length === action.points.length &&
          p.every((v, i) => v === action.points[i]),
      );
      if (echoIdx >= 0) {
        pendingLocalRef.current.splice(echoIdx, 1);
        continue;
      }
      const stroke: Stroke = {
        points: chunkPoints(action.points),
        color: action.color,
        width: action.width,
        tool: action.kind === "erase" ? "erase" : "pen",
      };
      strokesRef.current = [...strokesRef.current, stroke];
      changed = true;
    }
    if (changed) drawAll();
  }, [remoteActions, shared, drawAll]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) return;
    ctx.strokeStyle =
      stroke.tool === "erase" ? "oklch(0.985 0.012 90)" : stroke.color;
    ctx.lineWidth = stroke.tool === "erase" ? stroke.width * 3 : stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }

  function getPos(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    canvasRef.current?.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const stroke: Stroke = {
      points: [getPos(event)],
      color,
      width,
      tool,
    };
    currentStrokeRef.current = stroke;
    strokesRef.current = [...strokesRef.current, stroke];
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    const stroke = currentStrokeRef.current;
    stroke.points = [...stroke.points, getPos(event)];
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawStroke(ctx, stroke);
  }

  function handlePointerUp() {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    drawingRef.current = false;
    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    if (shared && actor && stroke.points.length >= 2) {
      const flat = stroke.points.flatMap((p) => [p.x, p.y]);
      pendingLocalRef.current = [...pendingLocalRef.current, flat];
      void actor.broadcastWhiteboardAction(
        stroke.tool,
        flat,
        stroke.color,
        stroke.width,
      );
    }
  }

  function handleClear() {
    strokesRef.current = [];
    pendingLocalRef.current = [];
    if (shared && actor) {
      void actor.broadcastWhiteboardAction("clear", [], color, width);
    }
    // Force a redraw
    drawAll();
  }

  function handleScreenshot() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute z-20 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
        fullScreen ? "inset-2" : "inset-x-6 top-16 bottom-24",
      )}
      data-ocid="classroom.whiteboard.panel"
    >
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-card px-3">
        <span className="font-display text-sm font-bold text-foreground">
          Whiteboard
        </span>
        <Tabs value={tool} onValueChange={(v) => setTool(v as "pen" | "erase")}>
          <TabsList className="h-8">
            <TabsTrigger value="pen" className="gap-1 text-xs">
              <Pen className="size-3.5" /> Pen
            </TabsTrigger>
            <TabsTrigger value="erase" className="gap-1 text-xs">
              <Eraser className="size-3.5" /> Erase
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "size-5 rounded-full border-2 transition-transform hover:scale-110",
                color === c ? "border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
              data-ocid="classroom.whiteboard.color_button"
            />
          ))}
        </div>

        <div className="flex w-28 items-center gap-2">
          <span className="text-xs text-muted-foreground">Width</span>
          <Slider
            value={[width]}
            min={1}
            max={20}
            onValueChange={(v) => setWidth(v[0])}
            aria-label="Stroke width"
            data-ocid="classroom.whiteboard.width_slider"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            type="button"
            variant={shared ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShared((v) => !v)}
            data-ocid="classroom.whiteboard.shared_toggle"
          >
            {shared ? "Shared" : "Local"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleScreenshot}
            data-ocid="classroom.whiteboard.screenshot_button"
          >
            <Camera className="size-4" /> Screenshot
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFullScreen((v) => !v)}
            aria-label={fullScreen ? "Half screen" : "Full screen"}
            data-ocid="classroom.whiteboard.fullscreen_toggle"
          >
            {fullScreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleClear}
            aria-label="Clear whiteboard"
            data-ocid="classroom.whiteboard.clear_button"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
            aria-label="Close whiteboard"
            data-ocid="classroom.whiteboard.close_button"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          data-ocid="classroom.whiteboard.canvas_target"
        />
        {remoteActions.length > 0 && shared ? (
          <p className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">
            {remoteActions.length} shared strokes
          </p>
        ) : null}
      </div>
    </div>
  );
}
