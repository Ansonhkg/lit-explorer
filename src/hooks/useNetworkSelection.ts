import {
  ICON_BY_CENTRALISATION,
  ICON_BY_CENTRALISATION_KEYS,
} from "@/configs/mappers";
import { DEFAULT_NETWORK, NETWORKS } from "@/configs/networks";
import {
  CENTRALISATION_BY_NETWORK,
  LIT_NETWORK,
  LIT_NETWORK_TYPES,
} from "@lit-protocol/constants";
import { useState } from "react";

const useNetworkSelection = (
  onNetworkChange?: (network: LIT_NETWORK_TYPES) => void
) => {
  const [selectedNetwork, setSelectedNetwork] =
    useState<LIT_NETWORK_TYPES>(DEFAULT_NETWORK);

  const handleNetworkChange = (network: LIT_NETWORK_TYPES) => {
    setSelectedNetwork(network);

    if (onNetworkChange) {
      onNetworkChange(network);
    }
  };

  const networkOptions = NETWORKS.map((network) => ({
    value: network,
    label: network,
    icon: ICON_BY_CENTRALISATION[
      CENTRALISATION_BY_NETWORK[
        LIT_NETWORK[network]
      ] as ICON_BY_CENTRALISATION_KEYS
    ],
  }));

  return {
    selectedNetwork,
    handleNetworkChange,
    networkOptions,
  };
};

export default useNetworkSelection;
