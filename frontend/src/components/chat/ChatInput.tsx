import { Send, Loader2, Lock } from "lucide-react";
import { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  agentName: string;
  isReadOnly?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isSending,
  agentName,
  isReadOnly = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isReadOnly) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-background border-t border-border p-6">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isReadOnly ? "This chat is read-only" : `Message ${agentName}...`}
            disabled={isSending || isReadOnly}
            rows={1}
            className="w-full px-4 py-4 bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon/50 border border-border focus:border-neon/30 disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[56px] max-h-[200px] overflow-y-auto scrollbar-hide text-sm transition-all"
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim() || isSending || isReadOnly}
          className="px-6 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 h-[56px] border border-primary"
        >
          {isReadOnly ? (
            <Lock className="w-5 h-5" />
          ) : (
            <Send className={`w-5 h-5 ${isSending ? "opacity-50" : ""}`} />
          )}
        </button>
      </div>
    </div>
  );
}
