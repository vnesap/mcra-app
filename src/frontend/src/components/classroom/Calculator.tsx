import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useRef, useState } from "react";

type Op = "+" | "-" | "×" | "÷";

const SCI_FUNCS = [
  "sin",
  "cos",
  "tan",
  "√",
  "x²",
  "log",
  "ln",
  "π",
  "e",
  "1/x",
];

interface CalculatorProps {
  onClose: () => void;
}

/**
 * A hovering, draggable, resizable scientific calculator widget. Supports
 * basic arithmetic plus common scientific functions.
 */
export function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [waiting, setWaiting] = useState(false);

  // Draggable + resizable state
  const [pos, setPos] = useState({ x: 40, y: 80 });
  const [size, setSize] = useState({ w: 300, h: 460 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    origW: number;
    origH: number;
  } | null>(null);

  function inputDigit(digit: string) {
    if (waiting) {
      setDisplay(digit);
      setWaiting(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }

  function inputDot() {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay(`${display}.`);
  }

  function applyOp(nextOp: Op) {
    const current = Number.parseFloat(display);
    if (prev !== null && op && !waiting) {
      const result = compute(prev, current, op);
      setPrev(result);
      setDisplay(String(result));
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setWaiting(true);
  }

  function compute(a: number, b: number, operation: Op): number {
    switch (operation) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b === 0 ? Number.NaN : a / b;
    }
  }

  function equals() {
    const current = Number.parseFloat(display);
    if (prev !== null && op) {
      const result = compute(prev, current, op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setWaiting(false);
    }
  }

  function clear() {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setWaiting(false);
  }

  function applyFunction(fn: string) {
    const value = Number.parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin":
        result = Math.sin((value * Math.PI) / 180);
        break;
      case "cos":
        result = Math.cos((value * Math.PI) / 180);
        break;
      case "tan":
        result = Math.tan((value * Math.PI) / 180);
        break;
      case "√":
        result = Math.sqrt(value);
        break;
      case "x²":
        result = value * value;
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "π":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      case "1/x":
        result = value === 0 ? Number.NaN : 1 / value;
        break;
      default:
        result = value;
    }
    setDisplay(String(result));
    setWaiting(false);
  }

  function handleDragStart(event: React.PointerEvent) {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: React.PointerEvent) {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.origX + (event.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (event.clientY - dragRef.current.startY),
    });
  }

  function handleDragEnd() {
    dragRef.current = null;
  }

  function handleResizeStart(event: React.PointerEvent) {
    event.stopPropagation();
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      origW: size.w,
      origH: size.h,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event: React.PointerEvent) {
    if (!resizeRef.current) return;
    setSize({
      w: Math.max(
        260,
        resizeRef.current.origW + (event.clientX - resizeRef.current.startX),
      ),
      h: Math.max(
        400,
        resizeRef.current.origH + (event.clientY - resizeRef.current.startY),
      ),
    });
  }

  function handleResizeEnd() {
    resizeRef.current = null;
  }

  const keypad: (string | Op)[] = [
    "C",
    "(",
    ")",
    "÷",
    "7",
    "8",
    "9",
    "×",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
    "⌫",
  ];

  return (
    <div
      className="absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
      data-ocid="classroom.calculator.panel"
    >
      {/* Title bar (drag handle) */}
      <div
        className="flex h-10 shrink-0 cursor-move items-center justify-between border-b bg-secondary/50 px-3 select-none"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        data-ocid="classroom.calculator.drag_handle"
      >
        <span className="text-sm font-bold text-foreground">Calculator</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
          aria-label="Close calculator"
          data-ocid="classroom.calculator.close_button"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Display */}
      <div className="shrink-0 border-b bg-background px-4 py-3 text-right">
        <div className="min-h-[2.5rem] truncate font-mono text-2xl font-semibold text-foreground">
          {display}
        </div>
      </div>

      {/* Scientific functions */}
      <div className="grid shrink-0 grid-cols-5 gap-1 p-2">
        {SCI_FUNCS.map((fn) => (
          <Button
            key={fn}
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 px-1 text-xs"
            onClick={() => applyFunction(fn)}
            data-ocid="classroom.calculator.function_button"
          >
            {fn}
          </Button>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-1.5 p-2">
        {keypad.map((key) => {
          const isDigit = /^[0-9]$/.test(key);
          const isOp = ["+", "-", "×", "÷"].includes(key);
          return (
            <Button
              key={key}
              type="button"
              variant={isOp ? "secondary" : isDigit ? "outline" : "ghost"}
              className={cn(
                "h-full text-base font-semibold",
                key === "=" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => {
                if (key === "C") clear();
                else if (key === "=") equals();
                else if (key === "⌫") setDisplay(display.slice(0, -1) || "0");
                else if (isOp) applyOp(key as Op);
                else if (key === ".") inputDot();
                else inputDigit(key);
              }}
              data-ocid="classroom.calculator.key_button"
            >
              {key}
            </Button>
          );
        })}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 bottom-0 h-5 w-5 cursor-nwse-resize"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        data-ocid="classroom.calculator.resize_handle"
      >
        <div className="absolute right-1 bottom-1 h-3 w-3 border-r-2 border-b-2 border-muted-foreground/50" />
      </div>
    </div>
  );
}
