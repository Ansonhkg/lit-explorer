import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { readContracts, writeContract } from "@wagmi/core";
import React, { useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { BaseUiProps } from "../types";

interface MintNextUIProps extends BaseUiProps {
  explorerUrl: string;
}

const MintNextUI: React.FC<MintNextUIProps> = ({
  config,
  contract,
  explorerUrl,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [recycleConfetti, setRecycleConfetti] = useState<boolean>(true);

  const { width, height } = useWindowSize();

  const handleAction = async () => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setShowConfetti(false);
    setRecycleConfetti(true);

    try {
      // Read mint cost
      const result = await readContracts(config, {
        contracts: [
          {
            address: contract.address as `0x${string}`,
            abi: contract.ABI,
            functionName: "mintCost",
            args: [],
          },
        ],
      });

      if (result[0].status === "failure") {
        throw new Error(`Error reading contract: ${result[0].error}`);
      }

      const mintCost = result[0].result as bigint;

      console.log("Mint cost:", mintCost);

      // Mint NFT
      const tx = await writeContract(config, {
        abi: contract.ABI,
        address: contract.address as `0x${string}`,
        functionName: "mintNext",
        args: [2n],
        value: mintCost,
      });

      console.log("Mint transaction:", tx);
      setTxHash(tx);
      setShowConfetti(true); // Show confetti on success

      // Stop generating new confetti after 3 seconds
      setTimeout(() => {
        setRecycleConfetti(false);
      }, 3000);

      // Hide confetti completely after an additional time
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTxUrl = (hash: string) => {
    return `${explorerUrl}${hash}`;
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAction} disabled={isLoading}>
        {isLoading ? "Minting..." : "Mint Next"}
      </Button>

      {isLoading && (
        <Alert>
          <AlertDescription>Minting in progress...</AlertDescription>
        </Alert>
      )}

      {txHash && (
        <Alert>
          <AlertDescription>
            Minting successful! View transaction:
            <a
              href={getTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)}
            </a>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showConfetti && (
        <Confetti width={width} height={height} recycle={recycleConfetti} />
      )}
    </div>
  );
};

export default MintNextUI;
