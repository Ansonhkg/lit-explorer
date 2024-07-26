import React from "react";
import { useBalance, useConfig } from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PKPsUI from "@/components/contracts/read/pkpsUi";
import { LIT_NETWORK_TYPES } from "@lit-protocol/constants";
import { getContractData } from "@/configs/contracts";

interface AddressResultProps {
  address: string;
  selectedNetwork: LIT_NETWORK_TYPES;
}

const AddressResult: React.FC<AddressResultProps> = ({
  address,
  selectedNetwork,
}) => {
  const config = useConfig();
  const {
    data: balanceData,
    isError,
    isLoading,
  } = useBalance({
    address: address as `0x${string}`,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            <strong>Address:</strong> {address}
          </p>
          {isLoading && <p>Loading balance...</p>}
          {isError && (
            <Alert variant="destructive">
              <AlertDescription>Error fetching balance</AlertDescription>
            </Alert>
          )}
          {balanceData && (
            <p>
              <strong>Balance:</strong> {balanceData.formatted}{" "}
              {balanceData.symbol}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PKPs owned by this address</CardTitle>
        </CardHeader>
        <CardContent>
          <PKPsUI
            config={config}
            contract={getContractData(selectedNetwork, "PKPNFT")}
            ownerAddress={address}
            pkpPermissionContract={getContractData(
              selectedNetwork,
              "PKPPermissions"
            )}
            selectedNetwork={selectedNetwork}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressResult;
