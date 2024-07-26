import React, { useState, useEffect } from "react";
import { computeAddress } from "ethers/lib/utils";
import { Buffer } from "buffer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicKeyResultProps {
  publicKey: string;
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
      <div className="flex items-center space-x-2">
        <span className="text-sm break-all">{value}</span>
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

const PublicKeyResult: React.FC<PublicKeyResultProps> = ({ publicKey }) => {
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const computeEthAddress = () => {
      setIsLoading(true);
      setError(null);

      try {
        let hexlessPubKey = publicKey.startsWith("0x")
          ? publicKey.slice(2)
          : publicKey;
        const pubkeyBuffer = Buffer.from(hexlessPubKey, "hex");
        const address = computeAddress(pubkeyBuffer);
        setEthAddress(address);
      } catch (err) {
        console.error("Error computing Ethereum address:", err);
        setError(
          "Failed to compute Ethereum address. Please check the public key format."
        );
      } finally {
        setIsLoading(false);
      }
    };

    computeEthAddress();
  }, [publicKey]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Public Key Result</CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardTitle>Public Key Result</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <CopyableField label="Public Key" value={publicKey} /> */}
        {ethAddress && (
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">ETH Address:</span>
            <div className="flex items-center space-x-2">
              <a
                href={`../address/${ethAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                {ethAddress}
                <ExternalLink className="h-3 w-3 ml-1" />
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

export default PublicKeyResult;
