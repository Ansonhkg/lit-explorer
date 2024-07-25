import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LIT_NETWORK,
  LIT_NETWORK_TYPES,
  METAMASK_CHAIN_INFO_BY_NETWORK,
  NETWORK_CONTEXT_BY_NETWORK,
} from "@lit-protocol/constants";
import Editor from "@monaco-editor/react";
import {
  Check,
  ChevronDown,
  Copy,
  PlayCircle,
  Search,
  Wallet,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useAccount,
  useChainId,
  useConfig,
  useConnect,
  useDisconnect,
  useBalance,
} from "wagmi";
import { NetworkSelector } from "./hooks/NetworkSelector";
import { useNetworkSelection } from "./hooks/useNetworkSelection";
import { useSwitchNetwork } from "./hooks/useSwitchNetwork";
import { getTabValue, TabType, VALID_TABS } from "./utils/tabs";
import { LitNetworkContext } from "./types";
import { ContractType, getContractData } from "./utils/contracts";
import { FAUCET_URL_BY_NETWORK } from "./utils/mappers";
import MintNextUI from "./func-components/write/mintNextUi";
import PKPsUI from "./func-components/read/pkpsUi";

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Mock function to generate NFTs for the profile page
const generateMockNFTs = () => {
  return Array(5)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      name: `NFT #${index + 1}`,
      image: `/api/placeholder/200/200?text=NFT ${index + 1}`,
    }));
};

// Mock function to generate contract addresses for the contracts page
const getContracts = (network: LIT_NETWORK_TYPES) => {
  const litNetwork = LIT_NETWORK[network];

  const networkContext: LitNetworkContext =
    NETWORK_CONTEXT_BY_NETWORK[litNetwork];

  const chainInfo = METAMASK_CHAIN_INFO_BY_NETWORK[litNetwork];

  chainInfo.blockExplorerUrls[0];

  const list = networkContext.data.map((context) => {
    const contract = context.contracts[0];
    return {
      name: context.name,
      address: contract.address_hash,
      url: `${chainInfo.blockExplorerUrls[0]}address/${contract.address_hash}`,
    };
  });

  return list;
};

const App = () => {
  // -- lit contract interactions

  // -- write contracts
  // const { writeContract } = useWriteContract();
  // const {readContrac} = useReadContract();

  // -- copy
  const [isCopied, setIsCopied] = useState(false);
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleCopyAddress = () => {
    if (!account.address) {
      console.log("No account address found");
      return;
    }

    navigator.clipboard.writeText(account.address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyABI = (identifier: string, abi: string) => {
    navigator.clipboard.writeText(abi);
    setCopiedItems((prev) => ({ ...prev, [identifier]: true }));
    setTimeout(() => {
      setCopiedItems((prev) => ({ ...prev, [identifier]: false }));
    }, 2000);
  };

  // -- wallets
  const [isWalletOptionsOpen, setIsWalletOptionsOpen] = useState(false);

  // -- tabs
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.slice(1);
    return path || "";
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/${value}`);
  };
  useEffect(() => {
    const path = location.pathname.slice(1) as TabType;
    if (!VALID_TABS.includes(path)) {
      navigate("/");
    } else {
      setActiveTab(path);
    }
  }, [location, navigate]);

  // -- networks
  const handleCustomNetworkChange = async (network: LIT_NETWORK_TYPES) => {
    const prefix = "handleCustomNetworkChange:";

    console.log(`${prefix} ${network}`);

    const chainInfo = METAMASK_CHAIN_INFO_BY_NETWORK[LIT_NETWORK[network]];
    console.log(`${prefix} chain?.id:`, chain?.id);
    console.log(`${prefix} chainInfo.chainId:`, chainInfo.chainId);
    // Automatically switch to the correct network if the user is connected to the wrong one
    if (chain?.id !== chainInfo.chainId) {
      console.log(`${prefix} Switching network...`);
      switchNetwork(chainInfo.chainId);
    }

    // Save the selected network to local storage
    localStorage.setItem("selectedNetwork", network);
  };

  const { selectedNetwork, handleNetworkChange, networkOptions } =
    useNetworkSelection(handleCustomNetworkChange);

  useEffect(() => {
    const savedNetwork = localStorage.getItem(
      "selectedNetwork"
    ) as LIT_NETWORK_TYPES | null;

    console.log("savedNetwork:", savedNetwork);
    console.log("networkOptions:", networkOptions);
    const networkOptionValues = networkOptions.map((option) => option.value);

    if (savedNetwork && networkOptionValues.includes(savedNetwork as any)) {
      console.log("Setting network from local storage:", savedNetwork);
      handleNetworkChange(savedNetwork);
    }
  }, []);

  const config = useConfig();

  const useNetwork = () => {
    const chainId = useChainId();
    const chain = config.chains.find((c) => c.id === chainId);
    return { chain };
  };

  const [code, setCode] = useState("// Write your code here");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mockNFTs] = useState(generateMockNFTs());
  const [mockContracts, setMockContracts] = useState(
    getContracts(selectedNetwork)
  );
  const [selectedChainInfo, setSelectedChainInfo] = useState(
    METAMASK_CHAIN_INFO_BY_NETWORK[LIT_NETWORK[selectedNetwork]]
  );

  const account = useAccount();
  // -- balance
  const userBalance = useBalance({
    address: account.address,
  });

  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  useEffect(() => {
    setMockContracts(getContracts(selectedNetwork));
    setSelectedChainInfo(
      METAMASK_CHAIN_INFO_BY_NETWORK[LIT_NETWORK[selectedNetwork]]
    );
  }, [selectedNetwork]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleConnect = (connector: any) => {
    connect({ connector, chainId: selectedChainInfo.chainId });
  };

  const isCorrectNetwork = chain?.id === selectedChainInfo.chainId;

  // Mock IPFS upload
  const handleUploadToIPFS = () => {
    // Simulate IPFS upload with a random hash
    const mockIPFSHash = `Qm${Math.random()
      .toString(36)
      .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setIpfsHash(mockIPFSHash);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (query.startsWith("0x") && query.length === 42) {
      // Ethereum address
      window.location.href = `/owners/${query}`;
    } else if (/^\d+$/.test(query) && query.length > 50) {
      // Token ID
      window.location.href = `/pkps/${query}`;
    } else if (query.startsWith("Qm") && query.length === 46) {
      // IPFS ID
      window.location.href = `/actions/${query}`;
    } else {
      alert(
        "Invalid search query. Please enter a valid Ethereum address, token ID, or IPFS ID."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#27233B] text-white flex flex-col font-['Space_Grotesk',sans-serif]">
      <header className="bg-[#27233B] p-4 flex justify-between items-center shadow-md">
        <a href="/" className="flex items-center space-x-2">
          <img src={"/lit-v0.svg"} alt="Lit Logo" className="h-6" />
          <h1 className="text-2xl text-white">Lit Explorer</h1>
        </a>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setIsSearchOpen(true)}
            className="text-black hover:bg-white bg-white rounded-md "
          >
            <Search className="mr-2 h-4 w-4" />
            Search (Ctrl+K)
          </Button>
          <Popover
            open={isWalletOptionsOpen}
            onOpenChange={setIsWalletOptionsOpen}
          >
            <PopoverTrigger asChild>
              {account.status === "connected" ? (
                <Button
                  variant="outline"
                  className="bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-800 border-purple-200 hover:border-purple-300 transition-all duration-200 font-semibold"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {shortenAddress(account.address)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </PopoverTrigger>

            <PopoverContent className="w-80">
              {account.status === "connected" ? (
                <div>
                  <div className="text-xs text-gray-400 text-center">
                    {/* Connected with: {account.connector?.name} */}
                    <img
                      src={account.connector?.icon}
                      alt={`${account.connector?.name} logo`}
                      className="h-6 w-6 mx-auto"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <Badge className="w-full flex" variant="outline">
                      <span className="m-auto"> {chain?.name}</span>
                    </Badge>
                  </div>

                  <div className="mt-2 text-center">
                    <p className="text-xl text-gray-500">
                      {Number(userBalance.data?.formatted).toFixed(6)}{" "}
                      {userBalance.data?.symbol}
                    </p>
                    {FAUCET_URL_BY_NETWORK[LIT_NETWORK[selectedNetwork]] && (
                      <a
                        href={
                          FAUCET_URL_BY_NETWORK[LIT_NETWORK[selectedNetwork]]
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Get Test Tokens
                      </a>
                    )}
                  </div>

                  <div className="flex items-center mt-2 mb-2 bg-gray-100 rounded-md">
                    <Input
                      value={account.address}
                      readOnly
                      className="bg-transparent border-none text-xs"
                      tabIndex={-1}
                    />
                    <Button
                      onClick={handleCopyAddress}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={() => disconnect()}
                    variant="destructive"
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {connectors.length <= 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        No wallet connectors available. Please make sure you
                        have a wallet installed or try refreshing the page.
                      </AlertDescription>
                    </Alert>
                  )}
                  {connectors.map((connector) => (
                    <Button
                      key={connector.id}
                      onClick={() => handleConnect(connector)}
                      className="w-full flex items-center justify-start space-x-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                    >
                      <img
                        src={connector.icon}
                        alt={`${connector.name} logo`}
                        className="w-6 h-6"
                      />
                      <span>{connector.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </header>
      <main className="flex-grow p-4">
        <Card className="w-full max-w-4xl mx-auto bg-white shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-6 mb-4">
              <NetworkSelector
                selectedNetwork={selectedNetwork}
                handleNetworkChange={handleNetworkChange}
                networkOptions={networkOptions}
              />
            </div>

            {/* -- Validations -- */}
            {!isCorrectNetwork && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  Connected to the wrong network. Please switch to{" "}
                  {selectedChainInfo.chainName}.
                </AlertDescription>
              </Alert>
            )}

            {status === "pending" && (
              <Alert variant="default" className="mb-6">
                <AlertDescription>Connecting to wallet...</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {isSearchOpen && (
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex space-x-2">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for address, token ID, or IPFS ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow border-purple-200"
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#5732AD] to-[#3E298D] hover:from-[#6842BD] hover:to-[#4E399D] text-white"
                  >
                    Search
                  </Button>
                </div>
              </form>
            )}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4 bg-[#27233B]">
                <TabsTrigger
                  value={getTabValue("")}
                  className="bg-red data-[state=active]:bg-gradient-to-r from-[#33257f] to-[#5f35b8] data-[state=active]:text-white"
                >
                  App
                </TabsTrigger>
                <TabsTrigger
                  value={getTabValue("create-action")}
                  className="data-[state=active]:bg-gradient-to-r from-[#33257f] to-[#5f35b8] data-[state=active]:text-white"
                >
                  Create Action
                </TabsTrigger>
                <TabsTrigger
                  value={getTabValue("profile")}
                  className="data-[state=active]:bg-gradient-to-r from-[#33257f] to-[#5f35b8] data-[state=active]:text-white"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value={getTabValue("contracts")}
                  className="data-[state=active]:bg-gradient-to-r from-[#33257f] to-[#5f35b8] data-[state=active]:text-white"
                >
                  Contracts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="">
                {account.status === "connected" ? (
                  <div className="mt-4">
                    <MintNextUI
                      config={config}
                      contract={getContractData(selectedNetwork, "PKPNFT")}
                      explorerUrl={`${selectedChainInfo.blockExplorerUrls[0]}/tx/`}
                    />
                  </div>
                ) : (
                  <div className="mt-4">
                    <Alert className="border-l-4 border-green-500 bg-green-50 p-4 rounded-md shadow-md">
                      <AlertTitle className="text-xl font-semibold text-green-700">
                        Welcome to Lit Explorer! 👋🏻
                      </AlertTitle>
                      <AlertDescription className="text-green-600">
                        <p>
                          Please sign in to your web3 account to access full
                          features.
                        </p>
                        <p className="mt-2">
                          To learn more about Programmable Key Pairs (PKPs) and
                          Lit Actions, read our{" "}
                          <a
                            target="_blank"
                            href="https://developer.litprotocol.com/"
                            className="text-blue-500 hover:underline"
                          >
                            documentation
                          </a>
                          .
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="create-action">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Action</h3>
                  <div className="h-[400px] border border-purple-200">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      defaultValue={code}
                      onChange={(value) => setCode(value || "")}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleUploadToIPFS}
                    className="w-full bg-gradient-to-r from-[#5732AD] to-[#3E298D] hover:from-[#6842BD] hover:to-[#4E399D] text-white"
                  >
                    Upload to IPFS
                  </Button>
                  {ipfsHash && (
                    <Alert>
                      <AlertDescription>
                        Uploaded to IPFS with hash: {ipfsHash}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="profile">
                <div className="space-y-4">
                  {/* <h3 className="text-lg font-semibold">Your NFTs</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {mockNFTs.map((nft) => (
                      <Card key={nft.id} className="border border-purple-200">
                        <CardContent className="p-4">
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-auto mb-2 rounded"
                          />
                          <p className="text-center">{nft.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div> */}
                  <PKPsUI
                    config={config}
                    contract={getContractData(selectedNetwork, "PKPNFT")}
                    ownerAddress={account.address as string}
                    pkpPermissionContract={getContractData(
                      selectedNetwork,
                      "PKPPermissions"
                    )}
                    selectedNetwork={selectedNetwork}
                  />
                </div>
              </TabsContent>
              <TabsContent value="contracts">
                <div className="space-y-6">
                  <Card className="p-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-sm">
                        <div
                          className="flex items-center cursor-pointer bg-gray-100 px-2 rounded-md"
                          onClick={() =>
                            handleCopyUrl(selectedChainInfo.chainId.toString())
                          }
                        >
                          <span className="font-semibold mr-2">
                            🔢 Chain ID:
                          </span>
                          <span className="flex-grow">
                            {selectedChainInfo.chainId}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-2">
                            {copiedUrl ===
                            selectedChainInfo.chainId.toString() ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div
                          className="flex items-center cursor-pointer bg-gray-100 px-2 rounded-md"
                          onClick={() =>
                            handleCopyUrl(selectedChainInfo.chainName)
                          }
                        >
                          <span className="font-semibold mr-2">
                            🏷️ Chain Name:
                          </span>
                          <span className="flex-grow text-purple-700">
                            {selectedChainInfo.chainName}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-2">
                            {copiedUrl === selectedChainInfo.chainName ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div
                          className="flex items-center cursor-pointer bg-gray-100 px-2 rounded-md"
                          onClick={() =>
                            handleCopyUrl(selectedChainInfo.nativeCurrency.name)
                          }
                        >
                          <span className="font-semibold mr-2">
                            💰 Native Currency:
                          </span>
                          <span className="flex-grow text-green-600">
                            {selectedChainInfo.nativeCurrency.name} (
                            {selectedChainInfo.nativeCurrency.symbol})
                          </span>
                          <Button variant="ghost" size="sm" className="ml-2">
                            {copiedUrl ===
                            selectedChainInfo.nativeCurrency.name ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div
                          className="flex items-center cursor-pointer bg-gray-100 px-2 rounded-md"
                          onClick={() =>
                            handleCopyUrl(
                              selectedChainInfo.nativeCurrency.decimals.toString()
                            )
                          }
                        >
                          <span className="font-semibold mr-2">
                            🔢 Decimals:
                          </span>
                          <span className="flex-grow">
                            {selectedChainInfo.nativeCurrency.decimals}
                          </span>
                          <Button variant="ghost" size="sm" className="ml-2">
                            {copiedUrl ===
                            selectedChainInfo.nativeCurrency.decimals.toString() ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-semibold mb-2">🌐 RPC URLs:</p>
                          <ul className="space-y-2">
                            {selectedChainInfo.rpcUrls.map((url, index) => (
                              <li
                                key={index}
                                className="flex items-center bg-gray-100 px-2 rounded-md cursor-pointer"
                                onClick={() => handleCopyUrl(url)}
                              >
                                <span className="truncate flex-grow text-gray-700">
                                  {url}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2"
                                >
                                  {copiedUrl === url ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold mb-2">
                            🔍 Block Explorer URLs:
                          </p>
                          <ul className="space-y-2">
                            {selectedChainInfo.blockExplorerUrls.map(
                              (url, index) => (
                                <li
                                  key={index}
                                  className="flex items-center bg-gray-100 px-2 rounded-md cursor-pointer"
                                  onClick={() => handleCopyUrl(url)}
                                >
                                  <span className="truncate flex-grow text-gray-700">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {url}
                                    </a>
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                  >
                                    {copiedUrl === url ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <h3 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
                    📑 Contract Addresses for {selectedNetwork}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-100">
                        <TableHead className="font-bold">
                          Contract Name
                        </TableHead>
                        <TableHead className="font-bold text-right">
                          Address
                        </TableHead>
                        <TableHead className="font-bold text-right">
                          Interact
                        </TableHead>
                        <TableHead className="font-bold text-right">
                          ABIs
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockContracts.map((contract, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-purple-50" : "bg-white"
                          }
                        >
                          <TableCell className="font-medium text-sm">
                            {contract.name}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <div className="flex items-center justify-end space-x-2 rounded-md cursor-pointer">
                              <a
                                href={contract.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex-grow"
                                title="View on Explorer"
                              >
                                {contract.address}
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => handleCopyUrl(contract.address)}
                              >
                                {copiedUrl === contract.address ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <a
                              href={`https://abi.ninja/${contract.address}/${chain?.id}`}
                              target="_blank"
                            >
                              <PlayCircle className="h-4 w-4 m-auto text-purple-800 hover:text-purple-300" />
                            </a>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => {
                                handleCopyABI(
                                  contract.address,
                                  JSON.stringify(
                                    getContractData(
                                      selectedNetwork,
                                      contract.name as ContractType
                                    ).ABI
                                  )
                                );
                              }}
                              className="bg-purple-200 text-purple-800 hover:bg-purple-300 hover:text-purple-900"
                            >
                              {copiedItems[contract.address] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <footer className="bg-[#27233B] p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <a
            href="https://developer.litprotocol.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Docs
          </a>
          <a
            href="https://litgateway.com/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Support
          </a>
        </div>
        <div className="text-white">
          © {new Date().getFullYear()} Lit Protocol
        </div>
      </footer>
    </div>
  );
};

export default App;
