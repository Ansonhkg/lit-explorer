import { LIT_NETWORK_VALUES } from "@lit-protocol/constants";

const CHRONICLE_FAUCET_URL = "https://chronicle-faucet-app.vercel.app";
const YELLOWSTONE_FAUCET_URL =
  "https://chronicle-yellowstone-faucet.getlit.dev";

/**
 * To be deprecated
 */
export const FAUCET_URL_BY_NETWORK: {
  [key in Exclude<LIT_NETWORK_VALUES, "custom" | "localhost">]: string;
} = {
  cayenne: CHRONICLE_FAUCET_URL,
  manzano: CHRONICLE_FAUCET_URL,
  habanero: CHRONICLE_FAUCET_URL,
  "datil-dev": YELLOWSTONE_FAUCET_URL,
  "datil-test": YELLOWSTONE_FAUCET_URL,
} as const;

/**
 * Configuration object that determines whether to use gas adjustment by network.
 * The keys represent the network names, and the values represent whether to use gas adjustment for that network.
 */
export const USE_GAS_ADJUSTMENT_BY_NETWORK: {
  [key: string]: boolean;
} = {
  cayenne: false,
  manzano: false,
  habanero: false,
  "datil-dev": true,
  "datil-test": true,
};

/**
 * Maps centralisation values to corresponding icons.
 */
export const ICON_BY_CENTRALISATION = {
  centralised: "🫑",
  decentralised: "🌶️",
} as const;

export type ICON_BY_CENTRALISATION_KEYS = keyof typeof ICON_BY_CENTRALISATION;
