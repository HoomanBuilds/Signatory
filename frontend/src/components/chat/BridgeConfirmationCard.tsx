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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <div className="relative overflow-hidden border border-[#333] bg-black">
        
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111] border border-[#333] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Confirm Bridge</h3>
              <p className="text-xs text-[#666] font-mono">Cross-chain transfer via DeBridge</p>
            </div>
          </div>
        </div>

        {/* Bridge Details */}
        <div className="relative px-5 py-5">
          {/* Chain Flow */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Source Chain */}
            <div className="flex-1 text-center p-3 bg-[#111] border border-[#333]">
              <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-bold text-white uppercase">{srcChain.replace("_", " ")}</p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Destination Chain */}
            <div className="flex-1 text-center p-3 bg-[#111] border border-[#333]">
              <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">To</p>
              <p className="text-sm font-bold text-white uppercase">{dstChain.replace("_", " ")}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center p-4 bg-[#111] border border-[#333] mb-4">
            <p className="text-3xl font-bold text-white font-mono">{amount}</p>
            <p className="text-sm font-medium text-[#888] uppercase">{token}</p>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm border border-[#333] p-3">
            {estimatedReceive && (
              <div className="flex justify-between text-[#888]">
                <span className="uppercase text-xs tracking-wider">You'll receive</span>
                <span className="font-mono text-white">~{estimatedReceive} {token}</span>
              </div>
            )}
            {fee && (
              <div className="flex justify-between text-[#888]">
                <span className="uppercase text-xs tracking-wider">Bridge fee</span>
                <span className="font-mono text-white">{fee} {token}</span>
              </div>
            )}
            {estimatedTime && (
              <div className="flex justify-between text-[#888]">
                <span className="uppercase text-xs tracking-wider">Est. time</span>
                <span className="font-mono text-white">~{estimatedTime} min</span>
              </div>
            )}
          </div>

          {/* Network Info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#666] font-mono">
            <div className="w-2 h-2 bg-white" />
            <span className="uppercase">Powered by DeBridge</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-[#333] bg-transparent text-[#888] font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-[#111] hover:border-white hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-white text-black font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>BRIDGING...</span>
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
