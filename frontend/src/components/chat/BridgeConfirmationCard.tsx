"use client";

import { motion } from "framer-motion";

interface BridgeConfirmationCardProps {
  srcChain: string;
  dstChain: string;
  amount: string;
  token: string;
  estimatedReceive?: string;
  fee?: string;
  estimatedTime?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "from-blue-500 to-indigo-600",
  sepolia: "from-blue-400 to-indigo-500",
  base: "from-blue-600 to-blue-800",
  base_sepolia: "from-blue-500 to-blue-700",
  polygon: "from-purple-500 to-purple-700",
  arbitrum: "from-blue-400 to-cyan-500",
  optimism: "from-red-500 to-rose-600",
};

export default function BridgeConfirmationCard({
  srcChain,
  dstChain,
  amount,
  token,
  estimatedReceive,
  fee,
  estimatedTime,
  onConfirm,
  onCancel,
  isLoading = false,
}: BridgeConfirmationCardProps) {
  const srcColor = CHAIN_COLORS[srcChain.toLowerCase()] || "from-gray-500 to-gray-600";
  const dstColor = CHAIN_COLORS[dstChain.toLowerCase()] || "from-gray-500 to-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-black/80 via-blue-950/20 to-black/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 animate-pulse" />
        
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-100">Confirm Bridge</h3>
              <p className="text-xs text-blue-400/70">Cross-chain transfer via DeBridge</p>
            </div>
          </div>
        </div>

        {/* Bridge Details */}
        <div className="relative px-5 py-5">
          {/* Chain Flow */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Source Chain */}
            <div className={`flex-1 text-center p-3 rounded-xl bg-gradient-to-br ${srcColor} bg-opacity-20 border border-white/10`}>
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-semibold text-white capitalize">{srcChain.replace("_", " ")}</p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Destination Chain */}
            <div className={`flex-1 text-center p-3 rounded-xl bg-gradient-to-br ${dstColor} bg-opacity-20 border border-white/10`}>
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">To</p>
              <p className="text-sm font-semibold text-white capitalize">{dstChain.replace("_", " ")}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center p-4 rounded-xl bg-black/40 border border-blue-500/10 mb-4">
            <p className="text-3xl font-bold text-blue-100">{amount}</p>
            <p className="text-sm font-medium text-blue-300">{token}</p>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {estimatedReceive && (
              <div className="flex justify-between text-blue-200/80">
                <span>You'll receive</span>
                <span className="font-medium text-blue-100">~{estimatedReceive} {token}</span>
              </div>
            )}
            {fee && (
              <div className="flex justify-between text-blue-200/80">
                <span>Bridge fee</span>
                <span className="font-medium text-blue-100">{fee} {token}</span>
              </div>
            )}
            {estimatedTime && (
              <div className="flex justify-between text-blue-200/80">
                <span>Est. time</span>
                <span className="font-medium text-blue-100">~{estimatedTime} min</span>
              </div>
            )}
          </div>

          {/* Network Info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-400/60">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Powered by DeBridge</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-blue-500/20 bg-black/40 text-blue-300 font-medium text-sm transition-all duration-200 hover:bg-blue-950/30 hover:border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-400 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Bridging...</span>
              </>
            ) : (
              <>
                <span>Confirm Bridge</span>
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
