import { X, MessageSquare, Plus, Trash2 } from "lucide-react";

interface ChatSession {
  sessionId: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

interface ChatHistorySliderProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession?: (sessionId: string) => void;
}

export default function ChatHistorySlider({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatHistorySliderProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/85 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Slider */}
      <div className="absolute left-0 top-0 h-full w-80 bg-background border-r border-ink-08 z-50 overflow-y-auto animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-ink-08 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-ink" />
            <h3 className="font-bold text-ink uppercase tracking-wide">History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-2 border border-transparent hover:border-ink-08 transition-all"
          >
            <X className="w-5 h-5 text-ink-40" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-ink-08">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full px-4 py-3 bg-sigil text-background font-bold uppercase tracking-wider hover:bg-sigil-hover transition-all flex items-center justify-center gap-2 border border-sigil"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="p-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-ink-08">
              <MessageSquare className="w-12 h-12 text-ink-24 mx-auto mb-3" />
              <p className="text-ink-40 text-sm font-bold uppercase tracking-wide">No history</p>
              <p className="text-ink-24 text-xs mt-1">
                Start a conversation
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`group relative p-4 transition-all cursor-pointer border ${
                    currentSessionId === session.sessionId
                      ? "bg-surface-2 border-signal"
                      : "bg-background border-ink-08 hover:border-signal"
                  }`}
                  onClick={() => {
                    onSelectSession(session.sessionId);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-ink uppercase tracking-wider bg-surface-3 px-1.5 py-0.5">
                          {session.messageCount} msgs
                        </span>
                        <span className="text-[10px] text-ink-40 font-mono">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-ink-60 line-clamp-2 font-mono leading-relaxed">
                        {session.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {onDeleteSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this chat session?"
                            )
                          ) {
                            onDeleteSession(session.sessionId);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-danger/10 text-ink-24 hover:text-danger rounded transition-all"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
