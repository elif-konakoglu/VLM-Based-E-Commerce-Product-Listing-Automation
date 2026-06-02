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
      <div className="rounded-lg border bg-gray-50 p-4 text-center text-sm text-gray-500">
        <MessageSquare className="mx-auto h-6 w-6 text-gray-300" />
        <p className="mt-2">Upload an image to chat with AI</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Ask AI about this product</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t">
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {history?.items.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === "admin"
                    ? "ml-8 bg-primary/10 text-gray-900"
                    : "mr-8 bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-xs font-medium text-gray-500">
                  {msg.role === "admin" ? "You" : "AI"}
                </span>
                <p className="mt-0.5">{msg.message}</p>
              </div>
            ))}
            {sendMutation.isPending && (
              <div className="mr-8 rounded-lg bg-gray-100 px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about style, material, category..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={sendMutation.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
              className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
