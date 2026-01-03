import { useState, useEffect } from "react";
import { Wallet, Copy, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from "lucide-react";

interface AgentWalletProps {
  tokenId: number;
  isOwner: boolean;
}

export default function AgentWallet({ tokenId, isOwner }: AgentWalletProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchWalletInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/agent-wallet/info?tokenId=${tokenId}`);
      if (response.ok) {
        const data = await response.json();
        setAddress(data.address);
        setBalance(data.balance);

        // Auto-register if needed
        if (data.address && !data.isRegistered) {
          console.log("Wallet not registered on-chain. Registering now...");
          try {
            await fetch("/api/agent/register-wallet", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                agentId: tokenId, 
                walletAddress: data.address 
              }),
            });
            console.log("Wallet auto-registered successfully!");
          } catch (err) {
            console.error("Failed to auto-register wallet:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletInfo();
  }, [tokenId]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied to clipboard!");
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw all funds to your wallet?")) return;

    try {
      setIsWithdrawing(true);
      const response = await fetch("/api/agent-wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully withdrawn ${data.amount} ETH!`);
        fetchWalletInfo(); 
      } else {
        alert(`Withdrawal failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading && !address) {
    return <div className="animate-pulse h-24 bg-emerald-500/5 rounded-xl"></div>;
  }

  return (
    <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-emerald-200 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Agent Wallet
        </h3>
        <button 
          onClick={fetchWalletInfo}
          className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-emerald-400/60 hover:text-emerald-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Balance */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-green-200/60 mb-1">Balance</div>
            <div className="text-2xl font-bold text-emerald-300">
              {parseFloat(balance).toFixed(4)} ETH
            </div>
          </div>
          {isOwner && parseFloat(balance) > 0 && (
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isWithdrawing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
              Withdraw
            </button>
          )}
        </div>

        {/* Address */}
        <div className="p-3 bg-black/40 rounded-lg border border-emerald-500/20 flex items-center justify-between group">
          <code className="text-sm text-emerald-400/80 font-mono truncate mr-4">
            {address}
          </code>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-emerald-500/20 rounded-md text-emerald-500/60 hover:text-emerald-400 transition-colors"
            title="Copy Address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-green-200/40">
          Fund this wallet to let the agent pay for its own chats.
        </div>
      </div>
    </div>
  );
}
