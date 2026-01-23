"use client";

import { motion } from "framer-motion";

interface SwapConfirmationCardProps {
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress?: string;
  network?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SwapConfirmationCard({
  fromToken,
  toToken,
  amount,
  walletAddress,
  network = "Sepolia",
  onConfirm,
  onCancel,
  isLoading = false,
}: SwapConfirmationCardProps) {
  // Truncate wallet address for display
  const truncatedAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-black/80 via-emerald-950/20 to-black/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 animate-pulse" />
        
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-100">Confirm Swap</h3>
              <p className="text-xs text-emerald-400/70">Review transaction details</p>
            </div>
          </div>
        </div>

        {/* Wallet Address Section */}
        {truncatedAddress && (
          <div className="relative px-5 py-3 border-b border-emerald-500/10 bg-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400/60">Agent Wallet</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">
                  {truncatedAddress}
                </code>
                <a
                  href={`https://sepolia.etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Swap Details */}
        <div className="relative px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* From Token */}
            <div className="flex-1 text-center p-4 rounded-xl bg-black/40 border border-emerald-500/10">
              <p className="text-xs text-emerald-400/60 uppercase tracking-wider mb-1">From</p>
              <p className="text-2xl font-bold text-emerald-100">{amount}</p>
              <p className="text-sm font-medium text-emerald-300">{fromToken}</p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* To Token */}
            <div className="flex-1 text-center p-4 rounded-xl bg-black/40 border border-emerald-500/10">
              <p className="text-xs text-emerald-400/60 uppercase tracking-wider mb-1">To</p>
              <p className="text-2xl font-bold text-emerald-100">~</p>
              <p className="text-sm font-medium text-emerald-300">{toToken}</p>
            </div>
          </div>

          {/* Network Info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400/60">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{network} Testnet • Uniswap V3</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-emerald-500/20 bg-black/40 text-emerald-300 font-medium text-sm transition-all duration-200 hover:bg-emerald-950/30 hover:border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Swapping...</span>
              </>
            ) : (
              <>
                <span>Confirm Swap</span>
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
