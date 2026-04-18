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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020203]/85 backdrop-blur-[8px] animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-2 border border-ink-08 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-ink-08 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-signal" />
            Confirm Purchase
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-ink-40 hover:text-ink transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-ink-40 mb-4">
              You are about to purchase
            </p>
            <h3 className="text-2xl font-bold text-signal mb-4">
              {agentName}
            </h3>
            <div className="glass-panel p-4 border border-ink-08">
              <div className="text-sm text-ink-40 mb-1">Total Price</div>
              <div className="text-3xl font-bold text-signal">
                {price} TCRO
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="py-3 bg-surface-3 border border-ink-08 text-ink font-medium hover:bg-surface-4 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
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

          <p className="text-xs text-ink-40 text-center">
            This transaction will be executed on the blockchain and cannot be reversed.
          </p>
        </div>
      </div>
    </div>
  );
}
