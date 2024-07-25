import { useConfig, useConnect, useDisconnect, useSwitchChain } from "wagmi";

const useSwitchNetwork = () => {
  // const config = useConfig();
  // const { connectAsync } = useConnect();

  const { chains, switchChain } = useSwitchChain();

  const switchNetwork = async (chainId: number) => {
    switchChain({ chainId });
    // const connector = config.connectors[0];
    // for (const connector of config.connectors) {
    //   try {
    //     // await connector.disconnect();
    //     // console.log("Disconnected:", connector.name);
    //     // await connectAsync({ connector, chainId });
    //   } catch (error) {
    //     console.error(`Error disconnecting from ${connector.name}:`, error);
    //   }
    // }
  };
  return { switchNetwork };
};

export default useSwitchNetwork;
