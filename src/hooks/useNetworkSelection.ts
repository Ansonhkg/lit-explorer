import { useState } from "react";
import {
  LIT_NETWORK,
  LIT_NETWORK_TYPES,
  CENTRALISATION_BY_NETWORK,
} from "@lit-protocol/constants";

const NETWORKS = (Object.keys(LIT_NETWORK) as (keyof typeof LIT_NETWORK)[])
  .filter((network) => {
    return network !== "Custom" && network !== "Localhost";
  })
  .sort(
    (a, b) => (a.includes("Datil") ? -1 : 1) - (b.includes("Datil") ? -1 : 1)
  );

export const useNetworkSelection = (
  onNetworkChange?: (network: LIT_NETWORK_TYPES) => void
) => {
  const [selectedNetwork, setSelectedNetwork] =
    useState<LIT_NETWORK_TYPES>("DatilDev");

  const handleNetworkChange = (network: LIT_NETWORK_TYPES) => {
    console.log(
      `[useNetworkSelection] handleNetworkChange: ${network}. onNetworkChange is ${
        onNetworkChange ? "defined" : "undefined"
      }`
    );
    setSelectedNetwork(network);

    if (onNetworkChange) {
      console.log(`[useNetworkSelection] onNetworkChange: ${network}`);
      onNetworkChange(network);
    }
  };

  const networkOptions = NETWORKS.map((network) => ({
    value: network,
    label: network,
    icon:
      CENTRALISATION_BY_NETWORK[LIT_NETWORK[network]] === "decentralised"
        ? "🌶️"
        : "🫑",
  }));

  return {
    selectedNetwork,
    handleNetworkChange,
    networkOptions,
  };
};
