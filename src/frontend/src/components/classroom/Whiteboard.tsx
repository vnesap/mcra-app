import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from '@supabase/supabase-js';
import envConfig from '../../env.json';
import {
  ArrowUpRight,
  Camera,
  Circle,
  Eraser,
  Maximize2,
  Minimize2,
  Minus,
  Pen,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_ANON_KEY);
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7", "#111827"];

type Tool = "pen" | "erase" | "rect" | "circle" | "line" | "arrow";

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  shape: Tool;
}

interface WhiteboardProps {
  onClose: () => void;
  roomCode?: string;
}

export function Whiteboard({ onClose, roomCode = "global-math" }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(4);
  const [fullScreen, setFullScreen] = useState(false);
  const [shared, setShared] = useState(true); // Default to live synced mode

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

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "oklch(0.985 0.012 90)";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = "oklch(0.9 0.02 90)";
    ctx.lineWidth = 1;
    const grid = 32;
    for (let x = 0; x <= rect.width; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
    }
    for (let y = 0; y <= rect.height; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
    }
    ctx.strokeStyle = "oklch(0.8 0.02 90)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(rect.width / 2, 0); ctx.lineTo(rect.width / 2, rect.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, rect.height / 2); ctx.lineTo(rect.width, rect.height / 2); ctx.stroke();

    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
  }, []);

  // REALTIME SYNC CHANNEL: Listen for incoming remote vector drawings instantly!
  useEffect(() => {
    if (!shared) return;
    const channel = supabase.channel(`board-${roomCode}`);

    channel
      .on('broadcast', { event: 'stroke' }, ({ payload }) => {
        strokesRef.current.push(payload.stroke);
        drawAll();
      })
      .on('broadcast', { event: 'clear' }, () => {
        strokesRef.current = [];
        drawAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode, shared, drawAll]);

  useEffect(() => { drawAll(); }, [drawAll, fullScreen]);
  function drawShape(ctx: CanvasRenderingContext2D, stroke: Stroke, start: { x: number; y: number }, end: { x: number; y: number }) {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    switch (stroke.shape) {
      case "rect":
        ctx.rect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
        break;
      case "circle":
        ctx.ellipse((start.x + end.x) / 2, (start.y + end.y) / 2, Math.abs(end.x - start.x) / 2, Math.abs(end.y - start.y) / 2, 0, 0, Math.PI * 2);
        break;
      case "line":
        ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
        break;
      case "arrow":
        ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLen = Math.max(12, stroke.width * 3);
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
        break;
    }
    ctx.stroke();
  }

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 1) return;
    if (stroke.shape === "pen" || stroke.shape === "erase") {
      ctx.strokeStyle = stroke.shape === "erase" ? "oklch(0.985 0.012 90)" : stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (const p of stroke.points) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (stroke.points.length >= 2) {
      drawShape(ctx, stroke, stroke.points[0], stroke.points[stroke.points.length - 1]);
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    drawingRef.current = true;
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    currentStrokeRef.current = { points: [p], color, width, shape: tool };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (tool === "pen" || tool === "erase") {
      currentStrokeRef.current.points.push(p);
      drawAll();
      drawStroke(ctx, currentStrokeRef.current);
    } else {
      drawAll();
      drawShape(ctx, currentStrokeRef.current, currentStrokeRef.current.points[0], p);
    }
  }

  function handleMouseUp() {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    drawingRef.current = false;
    strokesRef.current.push(currentStrokeRef.current);

    // BROADCAST ACTIONS OVER REALTIME INTERNET MATRICES INSTANTLY
    if (shared) {
      void supabase.channel(`board-${roomCode}`).send({
        type: 'broadcast',
        event: 'stroke',
        payload: { stroke: currentStrokeRef.current }
      });
    }
    currentStrokeRef.current = null;
    drawAll();
  }

  function handleClearAll() {
    strokesRef.current = [];
    if (shared) {
      void supabase.channel(`board-${roomCode}`).send({ type: 'broadcast', event: 'clear', payload: {} });
    }
    drawAll();
  }

  function takeScreenshot() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `math-lesson-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  return (
    <div ref={containerRef} className={cn("absolute inset-0 z-40 flex flex-col bg-background", fullScreen ? "fixed inset-0 h-screen w-screen" : "h-full w-full")}>
      <div className="flex items-center justify-between border-b bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant={tool === "pen" ? "default" : "outline"} size="icon" onClick={() => setTool("pen")}><Pen className="size-4" /></Button>
          <Button variant={tool === "erase" ? "default" : "outline"} size="icon" onClick={() => setTool("erase")}><Eraser className="size-4" /></Button>
          <Button variant={tool === "rect" ? "default" : "outline"} size="icon" onClick={() => setTool("rect")}><Square className="size-4" /></Button>
          <Button variant={tool === "circle" ? "default" : "outline"} size="icon" onClick={() => setTool("circle")}><Circle className="size-4" /></Button>
          <Button variant={tool === "line" ? "default" : "outline"} size="icon" onClick={() => setTool("line")}><Minus className="size-4" /></Button>
          <Button variant={tool === "arrow" ? "default" : "outline"} size="icon" onClick={() => setTool("arrow")}><ArrowUpRight className="size-4" /></Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={cn("size-6 rounded-full border", color === c ? "ring-2 ring-primary scale-110" : "")} style={{ backgroundColor: c }} />
            ))}
          </div>
          <Slider value={[width]} onValueChange={(v) => setWidth(v[0])} min={1} max={20} step={1} className="w-24" />
          <Button variant="outline" size="icon" onClick={takeScreenshot}><Camera className="size-4" /></Button>
          <Button variant="outline" size="icon" onClick={handleClearAll}><Trash2 className="size-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setFullScreen(!fullScreen)}>{fullScreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</Button>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
        </div>
      </div>
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="flex-1 cursor-crosshair touch-none" />
    </div>
  );
}
