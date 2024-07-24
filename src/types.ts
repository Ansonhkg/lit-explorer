type LitNetworkContextContractItem = {
  ABI: any[];
  address_hash: string;
  inserted_at: string;
  network: string;
};

type LitNetworkContextContract = {
  name: string;
  contracts: LitNetworkContextContractItem[];
};

export type LitNetworkContext = {
  config: {
    chainId: number;
    chainName: string;
    litNodeDomainName: string;
    litNodePort: number;
    rocketPort: number;
    rpcUrl: string;
  };
  data: LitNetworkContextContract[];
};
