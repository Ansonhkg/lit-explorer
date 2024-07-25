import React, { useState, useEffect } from "react";
import { BaseUiProps } from "../types";
import { readContracts } from "@wagmi/core";
import { ContractData } from "@/utils/contracts";
import { PKPInfo } from "@/types";
import { computeAddress } from "ethers/lib/utils";
import { Buffer } from "buffer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy, Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PKPsUIProp extends BaseUiProps {
  ownerAddress: string;
  pkpPermissionContract: ContractData;
  selectedNetwork: string;
}

const CopyableCell: React.FC<{ content: string; truncate?: boolean }> = ({
  content,
  truncate = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const displayContent = truncate
    ? `${content.slice(0, 6)}...${content.slice(-4)}`
    : content;

  return (
    <div className="flex items-center space-x-2">
      <div className="break-all text-xs">{displayContent}</div>
      <button
        onClick={copyToClipboard}
        className="p-1 hover:bg-gray-100 rounded flex-shrink-0 transition-colors duration-200"
        title={isCopied ? "Copied!" : "Copy to clipboard"}
      >
        {isCopied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
        )}
      </button>
    </div>
  );
};

const PKPsUI: React.FC<PKPsUIProp> = ({
  config,
  contract,
  ownerAddress,
  pkpPermissionContract,
  selectedNetwork,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<PKPInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pkpNftContract = contract;

  const getTokens = async () => {
    console.log("Getting tokens...");
    const _tokens: PKPInfo[] = [];
    let index = 0;
    let fetchTokens = true;

    const fetchToken = async (index: number) => {
      try {
        const result = await readContracts(config, {
          contracts: [
            {
              address: pkpNftContract.address as `0x${string}`,
              abi: pkpNftContract.ABI,
              functionName: "tokenOfOwnerByIndex",
              args: [ownerAddress, index],
            },
          ],
        });

        if (result[0].status === "failure") {
          fetchTokens = false;
          return null;
        }

        const tokenId = result[0].result;

        const result2 = await readContracts(config, {
          contracts: [
            {
              address: pkpPermissionContract.address as `0x${string}`,
              abi: pkpPermissionContract.ABI,
              functionName: "getPubkey",
              args: [tokenId],
            },
          ],
        });

        if (result2[0].status === "failure") {
          fetchTokens = false;
          return null;
        }

        const publicKey = result2[0].result as string;

        let hexlessPubKey = publicKey.startsWith("0x")
          ? publicKey.slice(2)
          : publicKey;

        const pubkeyBuffer = Buffer.from(hexlessPubKey, "hex");
        const ethAddress = computeAddress(pubkeyBuffer!);

        return {
          tokenId,
          publicKey: publicKey,
          ethAddress,
        };
      } catch (error) {
        console.error(`Error fetching token at index ${index}:`, error);
        fetchTokens = false;
        return null;
      }
    };

    while (fetchTokens) {
      const batch = await Promise.all([
        fetchToken(index),
        fetchToken(index + 1),
        fetchToken(index + 2),
      ]);

      index += 3;

      batch.forEach((token) => {
        if (token !== null) _tokens.push(token as PKPInfo);
      });

      if (batch.every((token) => token === null)) {
        fetchTokens = false;
      }
    }

    console.log("Tokens:", _tokens);

    const reveredOrderTokens = _tokens.reverse();
    return reveredOrderTokens;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTokens = await getTokens();
        setTokens(fetchedTokens);
      } catch (err) {
        setError("Failed to fetch tokens. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    ownerAddress,
    pkpNftContract.address,
    pkpPermissionContract.address,
    selectedNetwork,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center font-semibold mt-4">
          Loading your PKP tokens...
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-lg font-semibold text-purple-700">
          Your PKP Tokens
        </h2>
        <Badge variant="outline" className="text-xs">
          {tokens.length} Token{tokens.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      {tokens.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-purple-50">
                <TableHead className="w-1/4 text-purple-700">
                  Token ID
                </TableHead>
                <TableHead className="w-1/2 text-purple-700">
                  Public Key
                </TableHead>
                <TableHead className="w-1/4 text-purple-700">
                  ETH Address
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token, index) => (
                <TableRow
                  key={token.tokenId.toString()}
                  className={index % 2 === 0 ? "bg-white" : "bg-purple-50"}
                >
                  <TableCell>
                    <CopyableCell content={token.tokenId.toString()} />
                  </TableCell>
                  <TableCell>
                    {/* truncate */}
                    <CopyableCell content={token.publicKey} />
                  </TableCell>
                  <TableCell>
                    <CopyableCell content={token.ethAddress} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Alert>
          <Key className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            No tokens found for this address.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PKPsUI;
