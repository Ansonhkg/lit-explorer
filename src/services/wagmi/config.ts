import { metamaskChainInfo } from "@lit-protocol/constants";
import { createConfig, http } from "wagmi";
import { Chain } from "wagmi/chains";

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
