// utils/searchUtils.ts

export const SEARCH_TYPES = {
  TOKEN_ID: "token-id",
  PUBLIC_KEY: "public-key",
  ADDRESS: "address",
  IPFS_CID: "ipfs",
  UNKNOWN: "unknown",
} as const;

export const SEARCH_ROUTES = [
  SEARCH_TYPES.TOKEN_ID,
  SEARCH_TYPES.PUBLIC_KEY,
  SEARCH_TYPES.ADDRESS,
  SEARCH_TYPES.IPFS_CID,
] as const;
export type SearchRouteType = (typeof SEARCH_ROUTES)[number];

export type SearchType = (typeof SEARCH_TYPES)[keyof typeof SEARCH_TYPES];

export function determineInputType(input: string): SearchType {
  // Remove any whitespace and convert to lowercase
  const cleanInput = input.trim().toLowerCase();

  // Check for Token ID (a large number)
  if (/^\d+$/.test(cleanInput) && cleanInput.length > 50) {
    return SEARCH_TYPES.TOKEN_ID;
  }

  // Check for Public Key (starts with 0x and is 130 characters long)
  if (/^0x04[a-fA-F0-9]{128}$/.test(cleanInput)) {
    return SEARCH_TYPES.PUBLIC_KEY;
  }

  // Check for Eth Address (starts with 0x and is 42 characters long)
  if (/^0x[a-fA-F0-9]{40}$/.test(cleanInput)) {
    return SEARCH_TYPES.ADDRESS;
  }

  // Check for IPFS CID (CIDv0 and CIDv1 patterns)
  if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58})$/.test(input)) {
    return SEARCH_TYPES.IPFS_CID;
  }

  return SEARCH_TYPES.UNKNOWN;
}
