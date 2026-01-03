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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e1518] border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-emerald-500/10 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-emerald-200 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              {type === "revenue-share" ? "Session Expired" : "Insufficient Credits"}
            </h3>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1 rounded-lg hover:bg-emerald-500/10 text-emerald-400/60 hover:text-emerald-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-green-200/70">
            {description || "You don't have enough credits to send this message. You can pay directly for this single message or buy a credit package."}
          </p>

          <div className="grid gap-4">
            {/* Option 1: Pay Action */}
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="group relative flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-emerald-200">
                    {type === "revenue-share" ? "Buy Session Pack" : "Pay for Message"}
                  </div>
                  <div className="text-xs text-green-200/50">
                    {type === "revenue-share" ? "50 Messages" : "One-time payment"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-300">{cost} {currency}</div>
                {isProcessing && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400 ml-auto mt-1" />
                )}
              </div>
            </button>

            {/* Option 2: Buy Credits (Only for Credit Purchase) */}
            {type === "credit-purchase" && (
              <Link
                href="/profile"
                className="group flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-emerald-200">Buy Credits</div>
                    <div className="text-xs text-green-200/50">Save with packages</div>
                  </div>
                </div>
                <div className="text-emerald-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
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
