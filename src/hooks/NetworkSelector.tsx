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

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  handleNetworkChange,
  networkOptions,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">
        🌶️ Hot Pick: Choose Your Network!
      </h3>
      <p className="text-xs opacity-50 hover:opacity-1 text-gray-600">
        🌶️ Decentralised network | 🫑 Centralised network
      </p>

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
              {option.icon} {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
