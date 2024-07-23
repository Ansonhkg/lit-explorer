import React, { useState, useCallback } from "react";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import litLogo from "./assets/lit.svg";

const useLitConnection = () => {
  const [status, setStatus] = useState("Connect");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const connectToLit = useCallback(async () => {
    setStatus("Connecting...");
    setError("");
    try {
      const client = new LitNodeClient({
        litNetwork: "datil-dev",
      });
      await client.connect();
      console.log("Connected to Lit Protocol");
      setIsConnected(client.ready);
      setStatus(client.ready ? "Connected" : "Connection failed");
    } catch (err) {
      console.error("Error connecting to Lit:", err);
      setStatus("Connection failed");
      setError("Failed to connect to Lit Protocol. Please try again.");
      setIsConnected(false);
    }
  }, []);

  return { status, isConnected, error, connectToLit };
};

const App = () => {
  const { status, isConnected, error, connectToLit } = useLitConnection();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2">
            <img src={litLogo} alt="Lit Protocol logo" className="h-8 w-8" />
            <span>Lit + Vite React TS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={connectToLit}
              disabled={isConnected}
              className="w-full"
            >
              {status}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-gray-500">
        <a
          href="https://litprotocol.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          Learn more about Lit Protocol
        </a>
      </p>
    </div>
  );
};

export default App;
