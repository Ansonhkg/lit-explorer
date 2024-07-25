import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Check,
  Copy,
  Key,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Configurable constants
const TOKENS_PER_PAGE = 5;
const INITIAL_FETCH_COUNT = TOKENS_PER_PAGE;
const SUBSEQUENT_FETCH_COUNT = TOKENS_PER_PAGE;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTokens, setHasMoreTokens] = useState(true);
  const pkpNftContract = contract;
  const [fetchIndex, setFetchIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchToken = useCallback(
    async (index: number): Promise<PKPInfo | null> => {
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
          return null;
        }

        const tokenId: any = result[0].result;

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
        return null;
      }
    },
    [
      config,
      pkpNftContract.address,
      pkpNftContract.ABI,
      pkpPermissionContract.address,
      pkpPermissionContract.ABI,
      ownerAddress,
    ]
  );

  const fetchTokens = useCallback(
    async (startIndex: number, count: number) => {
      const newTokens: PKPInfo[] = [];
      for (let i = startIndex; i < startIndex + count; i++) {
        const token = await fetchToken(i);
        if (token) {
          newTokens.push(token);
        } else {
          setHasMoreTokens(false);
          break;
        }
      }
      return newTokens;
    },
    [fetchToken]
  );

  useEffect(() => {
    const loadInitialTokens = async () => {
      setIsLoading(true);
      setError(null);
      setTokens([]);
      setFetchIndex(0);
      setHasMoreTokens(true);
      try {
        const initialTokens = await fetchTokens(0, INITIAL_FETCH_COUNT);
        setTokens(initialTokens);
        setFetchIndex(INITIAL_FETCH_COUNT);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch tokens. Please try again later.");
        setIsLoading(false);
      }
    };

    loadInitialTokens();
  }, [
    fetchTokens,
    ownerAddress,
    pkpNftContract.address,
    pkpPermissionContract.address,
    selectedNetwork,
  ]);

  useEffect(() => {
    const loadMoreTokens = async () => {
      if (!hasMoreTokens || isLoading) return;

      try {
        const moreTokens = await fetchTokens(
          fetchIndex,
          SUBSEQUENT_FETCH_COUNT
        );
        if (moreTokens.length === 0) {
          setHasMoreTokens(false);
        } else {
          setTokens((prevTokens) => [...prevTokens, ...moreTokens]);
          setFetchIndex((prevIndex) => prevIndex + moreTokens.length);
        }
      } catch (err) {
        console.error("Error fetching more tokens:", err);
        setHasMoreTokens(false);
      }
    };

    loadMoreTokens();
  }, [fetchTokens, fetchIndex, hasMoreTokens, isLoading]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const lowercasedQuery = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.tokenId.toString().includes(lowercasedQuery) ||
        token.publicKey.toLowerCase().includes(lowercasedQuery) ||
        token.ethAddress.toLowerCase().includes(lowercasedQuery)
    );
  }, [tokens, searchQuery]);

  const pageCount = Math.ceil(filteredTokens.length / TOKENS_PER_PAGE);
  const paginatedTokens = filteredTokens.slice(
    (currentPage - 1) * TOKENS_PER_PAGE,
    currentPage * TOKENS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {filteredTokens.length} Token
            {filteredTokens.length !== 1 ? "s" : ""}
          </Badge>
          {hasMoreTokens && (
            <div className="flex items-center text-xs text-gray-500">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Filter by Token ID, Public Key, or ETH Address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
      </div>
      {filteredTokens.length > 0 ? (
        <>
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
                {paginatedTokens.map((token, index) => (
                  <TableRow
                    key={token.tokenId.toString()}
                    className={index % 2 === 0 ? "bg-white" : "bg-purple-50"}
                  >
                    <TableCell>
                      <CopyableCell content={token.tokenId.toString()} />
                    </TableCell>
                    <TableCell>
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
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={currentPage === pageCount}
              variant="outline"
              size="sm"
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
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
