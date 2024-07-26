export const shortAddr = (publicKey: string) => {
  return `0x${publicKey.slice(-40)}`;
};
interface options {
  start?: number;
  end?: number;
}
export const shortenAddress = (address: string, options?: options) => {
  const start = options?.start || 6;
  const end = options?.end || 4;

  return `${address.slice(0, start)}...${address.slice(-end)}`;
};
