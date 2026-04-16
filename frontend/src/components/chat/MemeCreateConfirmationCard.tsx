"use client";

import { motion } from "framer-motion";

interface MemeCreateConfirmationCardProps {
  name: string;
  ticker: string;
  description: string;
  imageUrl?: string;
  walletAddress?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MemeCreateConfirmationCard({
  name,
  ticker,
  description,
  imageUrl,
  walletAddress,
  onConfirm,
  onCancel,
  isLoading = false,
}: MemeCreateConfirmationCardProps) {
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
      <div className="relative overflow-hidden border border-[#333] bg-black">
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111] border border-[#333] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Create Meme Token</h3>
              <p className="text-xs text-[#666] font-mono">Four.meme · BSC Mainnet</p>
            </div>
          </div>
        </div>

        {/* Wallet */}
        {truncatedAddress && (
          <div className="relative px-5 py-3 border-b border-[#333] bg-[#111]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666] uppercase tracking-wider">Agent Wallet</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-white bg-black px-2 py-1 border border-[#333]">
                  {truncatedAddress}
                </code>
                <a
                  href={`https://bscscan.com/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#ccc] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Token Details */}
        <div className="relative px-5 py-5 space-y-3">
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-14 h-14 border border-[#333] object-cover" />
            ) : (
              <div className="w-14 h-14 bg-[#111] border border-[#333] flex items-center justify-center">
                <span className="text-xs text-[#666] font-mono">AI GEN</span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-lg font-bold text-white">{name}</p>
              <p className="text-sm font-mono text-[#888]">${ticker}</p>
            </div>
          </div>

          <p className="text-xs text-[#888] leading-relaxed line-clamp-2">{description}</p>

          <div className="flex items-center justify-between text-xs text-[#666] font-mono pt-1 border-t border-[#333]">
            <span className="uppercase">Creation Fee</span>
            <span className="text-white">0.01 BNB</span>
          </div>
        </div>

        {/* Buttons */}
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
                <span>CREATING...</span>
              </>
            ) : (
              <>
                <span>CREATE</span>
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
