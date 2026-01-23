"use client";

import { useState } from "react";
import { X, Wallet, ArrowUpRight, Loader2, Coins, Check } from "lucide-react";

interface Token {
  symbol: string;
  balance: string;
  name: string;
  address?: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  nativeBalance: string;
  nativeSymbol: string;
  tokens: Token[];
  onWithdrawSuccess: () => void;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  tokenId,
  nativeBalance,
  nativeSymbol,
  tokens,
  onWithdrawSuccess,
}: WithdrawModalProps) {
  const [selectedAsset, setSelectedAsset] = useState<"native" | string>("native");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ txHash: string; amount: string } | null>(null);

  if (!isOpen) return null;

  const getSelectedBalance = () => {
    if (selectedAsset === "native") {
      return parseFloat(nativeBalance).toFixed(6);
    }
    const token = tokens.find(t => t.symbol === selectedAsset);
    return token ? parseFloat(token.balance).toFixed(6) : "0";
  };

  const getSelectedSymbol = () => {
    if (selectedAsset === "native") {
      return nativeSymbol;
    }
    return selectedAsset;
  };

  const getSelectedAddress = () => {
    if (selectedAsset === "native") {
      return null;
    }
    const token = tokens.find(t => t.symbol === selectedAsset);
    return token?.address || null;
  };

  const handleWithdraw = async () => {
    const balance = getSelectedBalance();
    if (parseFloat(balance) === 0) {
      setError("No balance to withdraw");
      return;
    }

    setIsWithdrawing(true);
    setError(null);
    setSuccess(null);

    try {
      const body: any = { tokenId };
      
      // If withdrawing a token, include token address
      const tokenAddress = getSelectedAddress();
      if (tokenAddress) {
        body.tokenAddress = tokenAddress;
      }

      const response = await fetch("/api/agent-wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Withdrawal failed");
      }

      setSuccess({
        txHash: data.txHash,
        amount: data.amount,
      });
      onWithdrawSuccess();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
      console.error("Withdraw error:", err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const hasBalance = parseFloat(getSelectedBalance()) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-black border border-[#333] w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Withdraw Funds
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#222] text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success State */}
          {success && (
            <div className="bg-green-900/20 border border-green-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-bold">Withdrawal Successful!</span>
              </div>
              <p className="text-sm text-green-300/80 mb-2">
                {success.amount} {getSelectedSymbol()} has been sent to your wallet.
              </p>
              <a
                href={`https://explorer.cronos.org/testnet3/tx/${success.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-400 hover:underline font-mono break-all"
              >
                View Transaction →
              </a>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Asset Selection */}
          <div>
            <label className="block text-xs text-[#666] uppercase tracking-wider mb-3">
              Select Asset
            </label>
            <div className="space-y-2">
              {/* Native Token */}
              <button
                onClick={() => setSelectedAsset("native")}
                className={`w-full flex items-center justify-between p-4 border transition-all ${
                  selectedAsset === "native"
                    ? "bg-[#111] border-white"
                    : "bg-black border-[#333] hover:border-[#555]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">{nativeSymbol}</div>
                    <div className="text-xs text-[#666]">Native Token</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white">
                    {parseFloat(nativeBalance).toFixed(6)}
                  </div>
                </div>
              </button>

              {/* ERC20 Tokens */}
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedAsset(token.symbol)}
                  className={`w-full flex items-center justify-between p-4 border transition-all ${
                    selectedAsset === token.symbol
                      ? "bg-[#111] border-white"
                      : "bg-black border-[#333] hover:border-[#555]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white">{token.symbol}</div>
                      <div className="text-xs text-[#666]">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white">
                      {parseFloat(token.balance).toFixed(6)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#111] border border-[#333] p-4">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">
              You will receive
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {getSelectedBalance()} {getSelectedSymbol()}
            </div>
            <div className="text-xs text-[#666] mt-2">
              Gas fees will be deducted from the withdrawal amount
            </div>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !hasBalance || success !== null}
            className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-[#ddd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Withdrawing...
              </>
            ) : success ? (
              <>
                <Check className="w-5 h-5" />
                Done
              </>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5" />
                Withdraw {getSelectedSymbol()}
              </>
            )}
          </button>

          {/* Close Button (after success) */}
          {success && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-transparent border border-[#333] text-white font-bold uppercase tracking-wider hover:bg-[#111] transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
