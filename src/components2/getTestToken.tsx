import { FAUCET_URL_BY_NETWORK } from "@/utils/mappers";
import { LIT_NETWORK, LIT_NETWORK_TYPES } from "@lit-protocol/constants";

const GetTestToken: React.FC<{ selectedNetwork: string }> = ({
  selectedNetwork,
}) => {
  const litNetwork = LIT_NETWORK[selectedNetwork as LIT_NETWORK_TYPES];

  return (
    <a
      href={FAUCET_URL_BY_NETWORK[litNetwork]}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline text-xs"
    >
      Get test tokens
    </a>
  );
};  

export default GetTestToken;
