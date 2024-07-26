import { LIT_NETWORK } from "@lit-protocol/constants";

// Configuration constants
export const DEFAULT_NETWORK = "DatilDev" as const;
export const EXCLUDED_NETWORKS = ["Custom", "Localhost"];
export const PREFERRED_NETWORK_IDENTIFIER = "Datil";

/**
 * Array of available networks.
 * Excludes the "Custom" and "Localhost" networks.
 * Sorts the networks based on whether they include the string "Datil".
 *
 * @returns {string[]} The sorted array of available networks.
 */
export const NETWORKS = (
  Object.keys(LIT_NETWORK) as (keyof typeof LIT_NETWORK)[]
)
  .filter((network) => {
    return !EXCLUDED_NETWORKS.includes(network);
  })
  .sort(
    (a, b) =>
      (a.includes(PREFERRED_NETWORK_IDENTIFIER) ? -1 : 1) -
      (b.includes(PREFERRED_NETWORK_IDENTIFIER) ? -1 : 1)
  );
