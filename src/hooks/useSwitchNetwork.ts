import { useSwitchChain } from "wagmi";

const useSwitchNetwork = () => {
  const { switchChain } = useSwitchChain();

  const switchNetwork = async (chainId: number) => {
    switchChain({ chainId });
  };
  return { switchNetwork };
};

export default useSwitchNetwork;
