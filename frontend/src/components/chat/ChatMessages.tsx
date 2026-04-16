import { Message } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SwapConfirmationCard from "./SwapConfirmationCard";
import BridgeConfirmationCard from "./BridgeConfirmationCard";
import MemeCreateConfirmationCard from "./MemeCreateConfirmationCard";
import MemeBuySellConfirmationCard from "./MemeBuySellConfirmationCard";

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
  pendingMemeCreate?: {
    name: string;
    ticker: string;
    description: string;
    imageUrl?: string;
    walletAddress?: string;
  } | null;
  isMemeCreating?: boolean;
  onConfirmMemeCreate?: () => void;
  onCancelMemeCreate?: () => void;
  pendingMemeBuy?: {
    tokenAddress: string;
    amountBNB: string;
    walletAddress?: string;
  } | null;
  isMemeBuying?: boolean;
  onConfirmMemeBuy?: () => void;
  onCancelMemeBuy?: () => void;
  pendingMemeSell?: {
    tokenAddress: string;
    tokenAmount: string;
    walletAddress?: string;
  } | null;
  isMemeSelling?: boolean;
  onConfirmMemeSell?: () => void;
  onCancelMemeSell?: () => void;
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
  pendingMemeCreate = null,
  isMemeCreating = false,
  onConfirmMemeCreate,
  onCancelMemeCreate,
  pendingMemeBuy = null,
  isMemeBuying = false,
  onConfirmMemeBuy,
  onCancelMemeBuy,
  pendingMemeSell = null,
  isMemeSelling = false,
  onConfirmMemeSell,
  onCancelMemeSell,
}: ChatMessagesProps) {
  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center p-8 border border-[#333] bg-[#111]">
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
            Start a conversation
          </h3>
          <p className="text-[#666] font-mono text-sm">
            Send a message to chat with {agentName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-black">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
            }`}
        >
          <div
            className={`max-w-[75%] p-4 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.role === "user"
              ? "bg-white text-black font-medium border border-white"
              : "bg-[#111] text-[#ddd] border border-[#333]"
              }`}
          >
            {/* Role Label for clarity in stark theme */}
            <div className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${message.role === "user" ? "text-black/50" : "text-[#666]"}`}>
                {message.role === "user" ? "You" : agentName}
            </div>

            <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="my-3 border border-[#333]">
                        <div className="flex items-center justify-between px-3 py-1 bg-[#222] border-b border-[#333]">
                          <span className="text-xs text-[#888] font-mono uppercase">
                            {match[1]}
                          </span>
                        </div>
                        <div className="p-3 bg-black overflow-x-auto">
                          <code className={`${className} text-sm font-mono`} {...props}>
                            {children}
                          </code>
                        </div>
                      </div>
                    ) : (
                      <code
                        className={`font-mono text-xs px-1 py-0.5 ${message.role === "user" ? "bg-black/10 text-black" : "bg-[#222] text-[#aaa]"}`}
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
                    <li className="pl-1 marker:text-[#666]">{children}</li>
                  ),
                  a: ({ href, children }: any) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-1 underline-offset-2 hover:text-blue-400 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }: any) => (
                    <blockquote className={`border-l-2 pl-3 italic my-2 ${message.role === "user" ? "border-black/20 text-black/60" : "border-[#333] text-[#666]"}`}>
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }: any) => (
                    <div className="overflow-x-auto my-4 border border-[#333]">
                      <table className="min-w-full divide-y divide-[#333]">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }: any) => (
                    <thead className="bg-[#111]">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }: any) => (
                    <tbody className="divide-y divide-[#333] bg-transparent">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }: any) => (
                    <tr className="hover:bg-[#111] transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }: any) => (
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-[#666]">
                      {children}
                    </th>
                  ),
                  td: ({ children }: any) => (
                    <td className="px-4 py-2 text-sm whitespace-normal">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            <p className={`text-[10px] mt-2 text-right ${message.role === "user" ? "text-black/40" : "text-[#444]"}`}>
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

      {/* Meme Create Confirmation Card */}
      {pendingMemeCreate && onConfirmMemeCreate && onCancelMemeCreate && (
        <div className="flex justify-start">
          <MemeCreateConfirmationCard
            name={pendingMemeCreate.name}
            ticker={pendingMemeCreate.ticker}
            description={pendingMemeCreate.description}
            imageUrl={pendingMemeCreate.imageUrl}
            walletAddress={pendingMemeCreate.walletAddress}
            onConfirm={onConfirmMemeCreate}
            onCancel={onCancelMemeCreate}
            isLoading={isMemeCreating}
          />
        </div>
      )}

      {/* Meme Buy Confirmation Card */}
      {pendingMemeBuy && onConfirmMemeBuy && onCancelMemeBuy && (
        <div className="flex justify-start">
          <MemeBuySellConfirmationCard
            type="buy"
            tokenAddress={pendingMemeBuy.tokenAddress}
            amount={pendingMemeBuy.amountBNB}
            walletAddress={pendingMemeBuy.walletAddress}
            onConfirm={onConfirmMemeBuy}
            onCancel={onCancelMemeBuy}
            isLoading={isMemeBuying}
          />
        </div>
      )}

      {/* Meme Sell Confirmation Card */}
      {pendingMemeSell && onConfirmMemeSell && onCancelMemeSell && (
        <div className="flex justify-start">
          <MemeBuySellConfirmationCard
            type="sell"
            tokenAddress={pendingMemeSell.tokenAddress}
            amount={pendingMemeSell.tokenAmount}
            walletAddress={pendingMemeSell.walletAddress}
            onConfirm={onConfirmMemeSell}
            onCancel={onCancelMemeSell}
            isLoading={isMemeSelling}
          />
        </div>
      )}

      {isThinking && (
        <div className="flex justify-start">
          <div className="border border-[#333] bg-[#111] p-4 flex items-center space-x-2">
            <span className="text-xs text-[#666] uppercase tracking-wider font-bold mr-2">Thinking</span>
            <div className="w-1.5 h-1.5 bg-white animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-white animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-white animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );
}
