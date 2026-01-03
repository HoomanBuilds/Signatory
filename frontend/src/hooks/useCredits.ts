import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useCreditsContract } from "./useCreditsContract";

/**
 * Hook to fetch and manage user credits (combines API + contract)
 */
export function useCredits() {
  const { address } = useAccount();
  const creditsContract = useCreditsContract();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch from contract directly for real-time data
      const balanceBigInt = await creditsContract.getBalance(address);
      setBalance(Number(balanceBigInt));
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching credits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
    hasCredits: balance > 0,

    // Expose contract methods
    contract: creditsContract,
  };
}
