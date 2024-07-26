import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { BaseUiProps } from "../types";
import {
  readContracts,
  writeContract,
  getTransactionReceipt,
} from "@wagmi/core";
import { parseGwei } from "viem";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { USE_GAS_ADJUSTMENT_BY_NETWORK } from "@/utils/mappers";
import { LIT_NETWORK, LIT_NETWORK_TYPES } from "@lit-protocol/constants";
import GetTestToken from "@/lib/getTestToken";

// Configurable constants
const BUTTON_TEXT = "Mint a new PKP!";
const GAS_LIMIT_INCREASE = 110;

interface MintNextUIProps extends BaseUiProps {
  explorerUrl: string;
  enhancedUI?: boolean; // New prop to toggle between enhanced and simple UI
  selectedNetwork: string;
}

const MintNextUI: React.FC<MintNextUIProps> = ({
  config,
  contract,
  explorerUrl,
  enhancedUI = false, // Default to enhanced UI
  selectedNetwork,
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
      const fivePercentIncrease = BigInt(GAS_LIMIT_INCREASE); // 5% increase means multiplying by 1.05
      const increasedMintCost = (mintCost * fivePercentIncrease) / BigInt(100);

      const gas = parseGwei(increasedMintCost.toString());
      console.log("Mint cost:", mintCost);

      const useGasLimit =
        USE_GAS_ADJUSTMENT_BY_NETWORK[
          LIT_NETWORK[selectedNetwork as LIT_NETWORK_TYPES]
        ];

      console.log("Use gas limit:", useGasLimit);

      // Mint NFT
      const txHash = await writeContract(config, {
        abi: contract.ABI,
        address: contract.address as `0x${string}`,
        functionName: "mintNext",
        args: [2n],
        value: mintCost,
        ...(useGasLimit && { gas }),
      });

      const txReceipt = await getTransactionReceipt(config, {
        hash: txHash,
      });

      if (txReceipt.status === "reverted") {
        throw new Error(
          `Transaction reverted: ${JSON.stringify(txReceipt)} - ${txHash}`
        );
      }

      setTxHash(txHash);
      setShowConfetti(true);

      setTimeout(() => setRecycleConfetti(false), 3000);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTxUrl = (hash: string) => `${explorerUrl}${hash}`;

  const SimpleButton = () => (
    <Button onClick={handleAction} disabled={isLoading}>
      {isLoading ? "Minting..." : BUTTON_TEXT}
    </Button>
  );

  const EnhancedButton = () => (
    <Button
      onClick={handleAction}
      disabled={isLoading}
      className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Minting in progress...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <Sparkles className="mr-2 h-6 w-6" />
          {BUTTON_TEXT}
        </span>
      )}
    </Button>
  );

  return (
    <div>
      <div className="flex mb-2">
        <div className="m-auto">
          <GetTestToken selectedNetwork={selectedNetwork as string} />
        </div>
      </div>
      <div
        className={
          enhancedUI
            ? "space-y-6 max-w-md mx-auto p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-lg"
            : "space-y-4"
        }
      >
        {enhancedUI ? <EnhancedButton /> : <SimpleButton />}

        {isLoading && (
          <Alert className={enhancedUI ? "bg-blue-50 border-blue-200" : ""}>
            <AlertDescription className={enhancedUI ? "text-blue-700" : ""}>
              Minting in progress... Please wait while we create your PKP.
            </AlertDescription>
          </Alert>
        )}

        {txHash && (
          <Alert className={enhancedUI ? "bg-green-50 border-green-200" : ""}>
            <AlertDescription className={enhancedUI ? "text-green-700" : ""}>
              <span className="font-semibold">🎉 Minting successful!</span>
              <br />
              View transaction:
              <a
                href={getTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1 font-medium"
              >
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </a>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert
            variant="destructive"
            className={enhancedUI ? "bg-red-50 border-red-200" : ""}
          >
            <AlertDescription className={enhancedUI ? "text-red-700" : ""}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {showConfetti && enhancedUI && (
          <Confetti
            width={width}
            height={height}
            recycle={recycleConfetti}
            colors={["#C084FC", "#818CF8", "#38BDF8", "#4ADE80"]}
          />
        )}
      </div>
    </div>
  );
};

export default MintNextUI;
