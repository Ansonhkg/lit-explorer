import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Editor, { Monaco } from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface IPFSResultProps {
  ipfsHash?: string; // Optional since we may get it from URL
  onCodeChange?: (code: string) => void;
}

const IPFSResult: React.FC<IPFSResultProps> = ({
  ipfsHash: propIpfsHash,
  onCodeChange,
}) => {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<any>(null);
  const editorRef = React.useRef<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Extract the IPFS hash from the URL path after "ipfs/"
    const match = location.pathname.match(/ipfs\/(.+)/);
    const urlIpfsHash = match ? match[1] : null;
    const hash = urlIpfsHash || propIpfsHash;
    setHash(hash);

    const fetchIPFSContent = async (hash: string) => {
      if (!hash) {
        setCode(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
        if (!response.ok) {
          throw new Error("Failed to fetch IPFS content");
        }
        const content = await response.text();
        setCode(content);
      } catch (err) {
        console.error("Error fetching IPFS content:", err);
        setError(
          "Failed to fetch content from IPFS. Please check the hash and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (hash) {
      fetchIPFSContent(hash);
    }
  }, [location.pathname, propIpfsHash]);

  useEffect(() => {
    if (code && onCodeChange) {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);
  function handleEditorWillMount(monaco: Monaco) {
    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
    });

    // extra libraries
    const libSource = "";
    const libUri = "ts:filename/facts.d.ts";

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      libUri
    );

    // Creating a model for the library
    if (!monaco.editor.getModel(monaco.Uri.parse(libUri))) {
      monaco.editor.createModel(
        libSource,
        "typescript",
        monaco.Uri.parse(libUri)
      );
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading IPFS Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hash && !location.pathname.includes("ipfs")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IPFS Content Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Enter an IPFS hash in the search bar or URL to view its content.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Editor
          height="400px"
          defaultLanguage="javascript"
          value={code || ""}
          onChange={(value) => {
            setCode(value || "");
            if (onCodeChange) onCodeChange(value || "");
          }}
          beforeMount={handleEditorWillMount}
          onMount={(editor) => (editorRef.current = editor)}
          options={{
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default IPFSResult;
