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
    <div className="glass-panel border-t border-emerald-500/20 p-4">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isReadOnly ? "This chat is read-only" : `Message ${agentName}...`}
          disabled={isSending || isReadOnly}
          rows={1}
          className="flex-1 px-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_10px_rgba(52,211,153,0.2)] transition-all border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[48px] max-h-[200px] overflow-y-auto scrollbar-hide"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || isSending || isReadOnly}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[48px]"
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
