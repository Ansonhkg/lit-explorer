import React, { useState, useEffect } from "react";
import { useConfig } from "wagmi";
import { readContracts } from "@wagmi/core";
import { computeAddress } from "ethers/lib/utils";
import { Buffer } from "buffer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LIT_NETWORK_TYPES } from "@lit-protocol/constants";
import { getContractData } from "@/configs/contracts";

interface TokenIdResultProps {
  tokenId: string;
  selectedNetwork: LIT_NETWORK_TYPES;
}

const CopyableField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold">{label}:</span>
      <div className="flex items-center space-x-2 max-w-full">
        <span className="text-sm truncate max-w-xl" title={value}>
          {value}
        </span>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="sm"
          className="p-1"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

const TokenIdResult: React.FC<TokenIdResultProps> = ({
  tokenId,
  selectedNetwork,
}) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const config = useConfig();

  useEffect(() => {
    const fetchTokenDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const pkpPermissionContract = getContractData(
          selectedNetwork,
          "PKPPermissions"
        );

        // Fetch the public key
        const result = await readContracts(config, {
          contracts: [
            {
              address: pkpPermissionContract.address as `0x${string}`,
              abi: pkpPermissionContract.ABI,
              functionName: "getPubkey",
              args: [BigInt(tokenId)],
            },
          ],
        });

        if (result[0].status === "failure") {
          throw new Error("Failed to fetch public key");
        }

        const pubKey = result[0].result as string;
        setPublicKey(pubKey);

        // Compute Ethereum address
        let hexlessPubKey = pubKey.startsWith("0x") ? pubKey.slice(2) : pubKey;
        const pubkeyBuffer = Buffer.from(hexlessPubKey, "hex");
        const address = computeAddress(pubkeyBuffer);
        setEthAddress(address);
      } catch (err) {
        console.error("Error fetching token details:", err);
        setError("Failed to fetch token details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenDetails();
  }, [tokenId, selectedNetwork, config]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token ID Result</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token ID Result</CardTitle>
      </CardHeader>
      <CardContent>
        <CopyableField label="Token ID" value={tokenId} />
        {publicKey && <CopyableField label="Public Key" value={publicKey} />}
        {ethAddress && (
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">ETH Address:</span>
            <div className="flex items-center space-x-2 max-w-full">
              <a
                href={`../address/${ethAddress}`}
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                title={ethAddress}
              >
                {ethAddress}
              </a>
              <Button
                onClick={() => navigator.clipboard.writeText(ethAddress)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenIdResult;
