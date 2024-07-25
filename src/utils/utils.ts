export const shortAddr = (publicKey: string) => {
  return `0x${publicKey.slice(-40)}`;
};
