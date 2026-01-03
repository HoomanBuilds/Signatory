import { Plus, MessageSquare } from "lucide-react";

interface ChatSession {
  id: string;
  agentName: string;
  lastMessage: string;
  timestamp: number;
}

interface ChatHistorySidebarProps {
  agentName?: string;
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistorySidebar({
  agentName,
  selectedChatId,
  onSelectChat,
  onNewChat,
}: ChatHistorySidebarProps) {
  // TODO: Load actual chat history from backend/storage
  const chatSessions: ChatSession[] = [];

  if (!agentName) {
    return (
      <div className="w-64 glass-panel border-r border-emerald-500/20 flex items-center justify-center">
        <div className="text-center p-4">
          <MessageSquare className="w-12 h-12 text-emerald-300/30 mx-auto mb-2" />
          <p className="text-sm text-green-200/50">Select an agent</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 glass-panel border-r border-emerald-500/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-emerald-500/20">
        <h2 className="text-lg font-bold text-emerald-200 mb-1">{agentName}</h2>
        <p className="text-xs text-green-200/70">Chat History</p>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-emerald-500/20">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          New Chat
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chatSessions.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <MessageSquare className="w-8 h-8 text-emerald-400/50" />
            </div>
            <p className="text-sm font-medium text-emerald-200/70">No chat history</p>
            <p className="text-xs text-green-200/40 mt-1 max-w-[150px]">
              Start a new conversation to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chatSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectChat(session.id)}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${selectedChatId === session.id
                    ? "bg-emerald-500/20 border border-emerald-500/50 shadow-md shadow-emerald-500/5"
                    : "glass-panel border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:translate-x-1"
                  }`}
              >
                <div className="font-medium text-emerald-200 text-sm truncate mb-1 group-hover:text-emerald-100 transition-colors">
                  {session.agentName}
                </div>
                <div className="text-xs text-green-200/60 truncate group-hover:text-green-200/80 transition-colors">
                  {session.lastMessage}
                </div>
                <div className="text-[10px] text-green-200/40 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500/30 group-hover:bg-emerald-400/50 transition-colors"></span>
                  {new Date(session.timestamp).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
