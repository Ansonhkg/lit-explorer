import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LIT_NETWORK_TYPES } from "@lit-protocol/constants";

interface NetworkSelectorProps {
  selectedNetwork: LIT_NETWORK_TYPES;
  handleNetworkChange: (network: LIT_NETWORK_TYPES) => void;
  networkOptions: Array<{ value: string; label: string; icon: string }>;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  handleNetworkChange,
  networkOptions,
}) => {
  return (
    <div className="space-y-2 text-black">
      {/* <div>
        <p className="mt-1 text-xs opacity-50 hover:opacity-1 text-gray-600">
          🌶️ Decentralised network | 🫑 Centralised network
        </p>
      </div> */}

      <Select
        onValueChange={(value) =>
          handleNetworkChange(value as LIT_NETWORK_TYPES)
        }
        value={selectedNetwork}
      >
        <SelectTrigger className="w-full border-purple-200">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>

        <SelectContent>
          {networkOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="mr-2">{option.icon}</span><span className="mr-2">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NetworkSelector;
