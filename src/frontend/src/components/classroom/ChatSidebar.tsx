import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useChatMessages,
  useSendChatMessage,
  useSendReaction,
} from "@/hooks/useChat";
import type { ChatMessage, FileRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session";
import { loadConfig } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { FileText, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const REACTION_SYMBOLS = [
  "👍",
  "👋",
  "🕺",
  "💃",
  "😕",
  "🤗",
  "🎆",
  "🛑",
  "🚨",
  "⭐",
  "✨",
  "👏",
  "🚏",
  "💚",
];

const WORD_STICKERS = [
  "Great job!",
  "Try again!",
  "Gold sticker",
  "What!",
  "Wait!",
  "Almost",
  "1st",
  "Do over!",
  "Awesome!",
  "GT!",
  "TMI!",
  "Got it!",
  "Nah",
];

/** Convert a backend nanosecond timestamp to a readable clock time. */
function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Upload a browser File to object storage and return a FileRef for chat. */
async function uploadToStorage(file: File): Promise<FileRef> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await storageClient.putFile(
    bytes,
    undefined,
    file.type,
    file.name,
  );
  const url = await storageClient.getDirectURL(hash);
  return { url, name: file.name, size: BigInt(file.size), mimeType: file.type };
}

interface ChatSidebarProps {
  className?: string;
  onClose: () => void;
}

/** Right sidebar live chat with instant delivery, emoji, file sharing, and
 *  the floating reaction / worded-sticker grid. Capped at 1/3 screen width. */
export function ChatSidebar({ className, onClose }: ChatSidebarProps) {
  const name = useSessionStore((s) => s.name);
  const { data: messages = [] } = useChatMessages();
  const sendMessage = useSendChatMessage();
  const sendReaction = useSendReaction();

  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (messages.length === 0) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const canSend = draft.trim().length > 0 || pendingFile !== null;

  async function handleSend() {
    const text = draft.trim();
    const file = pendingFile;
    if (!text && !file) return;

    let fileRef: FileRef | null = null;
    if (file) {
      setUploading(true);
      setError(null);
      try {
        fileRef = await uploadToStorage(file);
      } catch {
        setError("Could not upload that file. Please try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    setDraft("");
    setPendingFile(null);
    sendMessage.mutate(
      { text, file: fileRef },
      {
        onError: () => {
          setError("Message could not be sent. Please try again.");
        },
      },
    );
  }

  function handlePickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPendingFile(file);
    event.target.value = "";
  }

  function handleDownload(message: ChatMessage) {
    if (!message.file) return;
    window.open(message.file.url, "_blank", "noopener,noreferrer");
  }

  return (
    <aside
      className={cn("flex flex-col", className)}
      data-ocid="classroom.chat.sidebar"
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <h2 className="font-display text-sm font-bold text-foreground">
          Live Chat
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClose}
          aria-label="Close chat"
          data-ocid="classroom.chat.close_button"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
        data-ocid="classroom.chat.scroll"
      >
        <div className="flex flex-col gap-2 p-3">
          {messages.length === 0 ? (
            <p
              className="py-8 text-center text-sm text-muted-foreground"
              data-ocid="classroom.chat.empty_state"
            >
              No messages yet. Say hello to the class!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id.toString()}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-subtle",
                  message.isSystem
                    ? "self-center bg-accent/30 text-accent-foreground"
                    : message.senderName === name
                      ? "self-end bg-primary text-primary-foreground"
                      : "self-start bg-secondary text-secondary-foreground",
                )}
                data-ocid="classroom.chat.message"
              >
                {!message.isSystem ? (
                  <p className="mb-0.5 text-xs font-semibold opacity-80">
                    {message.senderName}
                  </p>
                ) : null}
                {message.text ? (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                ) : null}
                {message.file ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(message)}
                    className="mt-1 flex items-center gap-2 rounded-lg bg-black/10 px-2 py-1 text-xs font-medium hover:bg-black/20"
                    data-ocid="classroom.chat.file_download"
                  >
                    <FileText className="size-3.5" />
                    <span className="truncate">{message.file.name}</span>
                  </button>
                ) : null}
                <p className="mt-0.5 text-right text-[10px] opacity-60">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Composer — primary action, taller than the reaction bar */}
      <div className="shrink-0 border-t p-3 pb-2">
        {pendingFile ? (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-secondary px-2 py-1.5 text-xs">
            <FileText className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{pendingFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setPendingFile(null)}
              aria-label="Remove file"
              data-ocid="classroom.chat.remove_file_button"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {error ? (
          <p
            className="mb-2 text-xs font-medium text-destructive"
            data-ocid="classroom.chat.error_state"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handlePickFile}
              data-ocid="classroom.chat.upload_input"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Attach a file"
              data-ocid="classroom.chat.upload_button"
            >
              <Paperclip className="size-5" />
            </Button>
          </label>
          <Input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Type a message…"
            className="h-11 flex-1 rounded-full text-sm"
            data-ocid="classroom.chat.input"
          />
          <Button
            type="button"
            size="icon"
            className="size-11 shrink-0 rounded-full"
            disabled={!canSend || uploading}
            onClick={() => void handleSend()}
            aria-label="Send message"
            data-ocid="classroom.chat.send_button"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>

      {/* Reaction emoji grid */}
      <div className="shrink-0 border-t p-2">
        <p className="mb-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
          Reactions
        </p>
        <div className="flex flex-wrap gap-1">
          {REACTION_SYMBOLS.map((symbol) => (
            <Tooltip key={symbol}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-lg hover:bg-accent"
                  onClick={() => sendReaction.mutate(symbol)}
                  aria-label={`Send reaction ${symbol}`}
                  data-ocid="classroom.chat.reaction_button"
                >
                  {symbol}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send {symbol}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Worded stickers */}
      <div className="shrink-0 border-t p-2">
        <p className="mb-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
          Stickers
        </p>
        <div className="flex flex-wrap gap-1">
          {WORD_STICKERS.map((sticker) => (
            <Button
              key={sticker}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-full px-2.5 text-xs"
              onClick={() => sendReaction.mutate(sticker)}
              data-ocid="classroom.chat.sticker_button"
            >
              {sticker}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
