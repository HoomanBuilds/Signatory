import { X, Coins, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  cost: string;
  currency: string;
  description?: string;
  type?: "credit-purchase" | "revenue-share";
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  cost,
  currency,
  description,
  type = "credit-purchase"
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020203]/85 backdrop-blur-[8px] animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-2 border border-ink-08 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-ink-08 bg-signal/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <Coins className="w-5 h-5 text-signal" />
              {type === "revenue-share" ? "Session Expired" : "Insufficient Credits"}
            </h3>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1 hover:bg-signal/10 text-ink-40 hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-ink-40">
            {description || "You don't have enough credits to send this message. You can pay directly for this single message or buy a credit package."}
          </p>

          <div className="grid gap-4">
            {/* Option 1: Pay Action */}
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="group relative flex items-center justify-between p-4 border border-ink-08 bg-surface-2 hover:bg-surface-3 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-signal/20 text-signal">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-ink">
                    {type === "revenue-share" ? "Buy Session Pack" : "Pay for Message"}
                  </div>
                  <div className="text-xs text-ink-40">
                    {type === "revenue-share" ? "50 Messages" : "One-time payment"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sigil font-mono">{cost} {currency}</div>
                {isProcessing && (
                  <Loader2 className="w-4 h-4 animate-spin text-signal ml-auto mt-1" />
                )}
              </div>
            </button>

            {/* Option 2: Buy Credits (Only for Credit Purchase) */}
            {type === "credit-purchase" && (
              <Link
                href="/profile"
                className="group flex items-center justify-between p-4 border border-ink-08 bg-surface-2 hover:bg-surface-3 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-signal/20 text-signal">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-ink">Buy Credits</div>
                    <div className="text-xs text-ink-40">Save with packages</div>
                  </div>
                </div>
                <div className="text-signal text-sm font-bold group-hover:translate-x-1 transition-transform">
                  Go to Profile →
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
