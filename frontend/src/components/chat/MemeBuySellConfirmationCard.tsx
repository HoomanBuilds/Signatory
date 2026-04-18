"use client";

import { motion } from "framer-motion";

interface MemeBuySellConfirmationCardProps {
  type: "buy" | "sell";
  tokenAddress: string;
  amount: string;
  walletAddress?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MemeBuySellConfirmationCard({
  type,
  tokenAddress,
  amount,
  walletAddress,
  onConfirm,
  onCancel,
  isLoading = false,
}: MemeBuySellConfirmationCardProps) {
  const isBuy = type === "buy";
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;
  const truncatedToken = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <div className="relative overflow-hidden border border-ink-08 bg-surface-1">
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-ink-08">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-2 border border-ink-08 flex items-center justify-center">
              {isBuy ? (
                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink uppercase tracking-wide">
                {isBuy ? "Buy Meme Token" : "Sell Meme Token"}
              </h3>
              <p className="text-xs text-ink-40 font-mono">Four.meme · BSC Mainnet</p>
            </div>
          </div>
        </div>

        {/* Wallet */}
        {truncatedAddress && (
          <div className="relative px-5 py-3 border-b border-ink-08 bg-surface-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-40 uppercase tracking-wider">Agent Wallet</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-ink bg-background px-2 py-1 border border-ink-08">
                  {truncatedAddress}
                </code>
                <a
                  href={`https://bscscan.com/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:text-ink-40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Trade Details */}
        <div className="relative px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            {isBuy ? (
              <>
                {/* Spending BNB */}
                <div className="flex-1 text-center p-4 bg-surface-2 border border-ink-08">
                  <p className="text-[10px] text-ink-40 uppercase tracking-wider mb-1">Spend</p>
                  <p className="text-2xl font-bold text-ink font-mono">{amount}</p>
                  <p className="text-sm font-medium text-ink-40">BNB</p>
                </div>
                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-sigil flex items-center justify-center">
                    <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                {/* Receiving Token */}
                <div className="flex-1 text-center p-4 bg-surface-2 border border-ink-08">
                  <p className="text-[10px] text-ink-40 uppercase tracking-wider mb-1">Receive</p>
                  <p className="text-2xl font-bold text-ink font-mono">~</p>
                  <p className="text-xs font-mono text-ink-40 truncate">{truncatedToken}</p>
                </div>
              </>
            ) : (
              <>
                {/* Selling Token */}
                <div className="flex-1 text-center p-4 bg-surface-2 border border-ink-08">
                  <p className="text-[10px] text-ink-40 uppercase tracking-wider mb-1">Sell</p>
                  <p className="text-2xl font-bold text-ink font-mono">{amount}</p>
                  <p className="text-xs font-mono text-ink-40 truncate">{truncatedToken}</p>
                </div>
                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-sigil flex items-center justify-center">
                    <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                {/* Receiving BNB */}
                <div className="flex-1 text-center p-4 bg-surface-2 border border-ink-08">
                  <p className="text-[10px] text-ink-40 uppercase tracking-wider mb-1">Receive</p>
                  <p className="text-2xl font-bold text-ink font-mono">~</p>
                  <p className="text-sm font-medium text-ink-40">BNB</p>
                </div>
              </>
            )}
          </div>

          {/* Token Address */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-40 font-mono">
            <div className="w-2 h-2 bg-signal" />
            <span className="uppercase">BSC Mainnet · Bonding Curve</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-ink-08 bg-transparent text-ink-40 font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:border-signal hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-sigil text-background font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-sigil-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isBuy ? "BUYING..." : "SELLING..."}</span>
              </>
            ) : (
              <>
                <span>CONFIRM</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
