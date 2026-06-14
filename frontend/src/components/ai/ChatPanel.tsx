import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { sendChatMessage, getChatHistory } from "@/api/ai";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  imageId: string | null;
  productId?: string;
  context?: Record<string, unknown>;
}

export default function ChatPanel({ imageId, productId, context }: ChatPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: history, refetch } = useQuery({
    queryKey: ["chat-history", imageId, productId],
    queryFn: () => getChatHistory(imageId!, productId),
    enabled: !!imageId && expanded,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      sendChatMessage({
        image_id: imageId!,
        message: input,
        product_id: productId,
        context,
      }),
    onSuccess: () => {
      setInput("");
      refetch();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
  });

  const handleSend = () => {
    if (!input.trim() || !imageId) return;
    sendMutation.mutate();
  };

  if (!imageId) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-5 text-center">
        <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Upload an image to chat with AI</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-card-foreground">Ask AI about this product</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {history?.items.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`rounded-xl px-3.5 py-2.5 text-sm ${
                  msg.role === "admin"
                    ? "ml-8 bg-primary/10 text-card-foreground border border-primary/10"
                    : "mr-8 bg-secondary text-card-foreground"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  msg.role === "admin" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {msg.role === "admin" ? "You" : "AI Assistant"}
                </span>
                <p className="mt-1">{msg.message}</p>
              </div>
            ))}
            {sendMutation.isPending && (
              <div className="mr-8 rounded-xl bg-secondary px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about style, material, category..."
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={sendMutation.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
