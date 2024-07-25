import { http, createConfig } from "wagmi";
import { Chain, mainnet, sepolia } from "wagmi/chains";
import { metamaskChainInfo } from "@lit-protocol/constants";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export const yellowstoneChain: Chain = {
  ...metamaskChainInfo.yellowstone,
  id: metamaskChainInfo.yellowstone.chainId,
  name: metamaskChainInfo.yellowstone.chainName,
  rpcUrls: {
    default: {
      http: metamaskChainInfo.yellowstone.rpcUrls,
    },
  },
};

export const chronicleChain: Chain = {
  ...metamaskChainInfo.chronicle,
  id: metamaskChainInfo.chronicle.chainId,
  name: metamaskChainInfo.chronicle.chainName,
  rpcUrls: {
    default: {
      http: metamaskChainInfo.chronicle.rpcUrls,
    },
  },
};

export const config = createConfig({
  chains: [yellowstoneChain, chronicleChain],
  connectors: [
    // injected({
    // }),
    // injected({
    //   target: 'coinbaseWallet',
    // }),
    // coinbaseWallet(),
    // walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [yellowstoneChain.id]: http(),
    [chronicleChain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
