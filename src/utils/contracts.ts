import {
  LIT_NETWORK,
  LIT_NETWORK_TYPES,
  NETWORK_CONTEXT_BY_NETWORK,
} from "@lit-protocol/constants";
import { datil } from "@lit-protocol/contracts";

export type ContractType =
  | "StakingBalances"
  | "Staking"
  | "Multisender"
  | "LITToken"
  | "PubkeyRouter"
  | "PKPNFT"
  | "RateLimitNFT"
  | "PKPHelper"
  | "PKPPermissions"
  | "PKPNFTMetadata"
  | "Allowlist"
  | "PaymentDelegation";

/**
 * Retrieves contract data for a given network.
 * @param network - The network type.
 * @returns An object containing the contract address and ABI.
 */
export function getContractData(
  network: LIT_NETWORK_TYPES,
  contractName: ContractType
) {
  const data = NETWORK_CONTEXT_BY_NETWORK[LIT_NETWORK[network]];

  const contractData = (data as typeof datil).data.filter(
    (contract) => contract.name === contractName
  )[0].contracts[0];

  if (!contractData) {
    throw new Error(
      `Contract data for ${contractName} not found on ${network} network.`
    );
  }

  const contractAddress = contractData.address_hash;
  const contractABI = contractData.ABI;

  return {
    address: contractAddress,
    ABI: contractABI,
  };
}
