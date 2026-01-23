import { Message } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SwapConfirmationCard from "./SwapConfirmationCard";
import BridgeConfirmationCard from "./BridgeConfirmationCard";

interface ChatMessagesProps {
  messages: Message[];
  agentName: string;
  isThinking?: boolean;
  pendingSwap?: {
    fromToken: string;
    toToken: string;
    amount: string;
    walletAddress?: string;
    network?: string;
  } | null;
  isSwapping?: boolean;
  onConfirmSwap?: () => void;
  onCancelSwap?: () => void;
  pendingBridge?: {
    srcChain: string;
    dstChain: string;
    amount: string;
    token: string;
    walletAddress?: string;
  } | null;
  isBridging?: boolean;
  onConfirmBridge?: () => void;
  onCancelBridge?: () => void;
}

export default function ChatMessages({
  messages,
  agentName,
  isThinking = false,
  pendingSwap = null,
  isSwapping = false,
  onConfirmSwap,
  onCancelSwap,
  pendingBridge = null,
  isBridging = false,
  onConfirmBridge,
  onCancelBridge,
}: ChatMessagesProps) {
  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-bold text-emerald-200 mb-2">
            Start a conversation
          </h3>
          <p className="text-green-200/70">
            Send a message to chat with {agentName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
            }`}
        >
          <div
            className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${message.role === "user"
              ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 text-emerald-100 shadow-emerald-500/5"
              : "glass-panel border border-emerald-500/10 bg-black/40 text-green-100 hover:border-emerald-500/20"
              }`}
          >
            <div className="prose prose-sm max-w-none prose-invert prose-p:leading-relaxed prose-pre:p-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="rounded-lg overflow-hidden my-2 bg-black/50 border border-emerald-500/20">
                        <div className="flex items-center justify-between px-3 py-1 bg-emerald-900/20 border-b border-emerald-500/20">
                          <span className="text-xs text-emerald-400 font-mono">
                            {match[1]}
                          </span>
                        </div>
                        <div className="p-3 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      </div>
                    ) : (
                      <code
                        className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  ul: ({ children }: any) => (
                    <ul className="list-disc list-outside ml-4 mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }: any) => (
                    <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }: any) => (
                    <li className="text-sm pl-1 marker:text-emerald-400 [&>p]:m-0">{children}</li>
                  ),
                  a: ({ href, children }: any) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-2 border-emerald-500/50 pl-3 italic my-2 text-emerald-200/80">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }: any) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-emerald-500/20">
                      <table className="min-w-full divide-y divide-emerald-500/20 bg-black/20">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }: any) => (
                    <thead className="bg-emerald-900/20">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }: any) => (
                    <tbody className="divide-y divide-emerald-500/10 bg-transparent">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }: any) => (
                    <tr className="hover:bg-emerald-500/5 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }: any) => (
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-300 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }: any) => (
                    <td className="px-4 py-3 text-sm text-emerald-100/80 whitespace-normal">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            <p className="text-xs opacity-50 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      
      {/* Swap Confirmation Card */}
      {pendingSwap && onConfirmSwap && onCancelSwap && (
        <div className="flex justify-start">
          <SwapConfirmationCard
            fromToken={pendingSwap.fromToken}
            toToken={pendingSwap.toToken}
            amount={pendingSwap.amount}
            walletAddress={pendingSwap.walletAddress}
            network={pendingSwap.network}
            onConfirm={onConfirmSwap}
            onCancel={onCancelSwap}
            isLoading={isSwapping}
          />
        </div>
      )}

      {/* Bridge Confirmation Card */}
      {pendingBridge && onConfirmBridge && onCancelBridge && (
        <div className="flex justify-start">
          <BridgeConfirmationCard
            srcChain={pendingBridge.srcChain}
            dstChain={pendingBridge.dstChain}
            amount={pendingBridge.amount}
            token={pendingBridge.token}
            onConfirm={onConfirmBridge}
            onCancel={onCancelBridge}
            isLoading={isBridging}
          />
        </div>
      )}
      
      {isThinking && (
        <div className="flex justify-start">
          <div className="glass-panel border border-emerald-500/10 bg-black/40 text-green-100 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex space-x-1 h-6 items-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
