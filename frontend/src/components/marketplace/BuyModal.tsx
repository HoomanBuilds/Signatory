"use client";

import { X, Loader2, ShoppingCart } from "lucide-react";
import { formatEther } from "viem";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  price: string;
  isPending: boolean;
  isConfirming: boolean;
}

export default function BuyModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  price,
  isPending,
  isConfirming,
}: BuyModalProps) {
  if (!isOpen) return null;

  const isProcessing = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Confirm Purchase
          </h2>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="text-white/40 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-white/60 mb-4">
              You are about to purchase
            </p>
            <h3 className="text-2xl font-bold text-emerald-300 mb-4">
              {agentName}
            </h3>
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/20">
              <div className="text-sm text-green-200/60 mb-1">Total Price</div>
              <div className="text-3xl font-bold text-emerald-300">
                {price} TCRO
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirm in Wallet...
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Buy Now"
              )}
            </button>
          </div>

          <p className="text-xs text-white/40 text-center">
            This transaction will be executed on the blockchain and cannot be reversed.
          </p>
        </div>
      </div>
    </div>
  );
}
