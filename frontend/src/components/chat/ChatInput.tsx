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
    <div className="bg-black border-t border-[#333] p-6">
      <div className="flex gap-4 items-end max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isReadOnly ? "This chat is read-only" : `Message ${agentName}...`}
          disabled={isSending || isReadOnly}
          rows={1}
          className="flex-1 px-4 py-4 bg-[#111] text-white placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-white border border-[#333] disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[56px] max-h-[200px] overflow-y-auto scrollbar-hide font-mono text-sm"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || isSending || isReadOnly}
          className="px-6 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-[#ddd] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[56px] border border-white"
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
