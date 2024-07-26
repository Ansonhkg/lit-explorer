import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import uploadToIPFS from "@/apis/upload";
import { Check, Copy, ExternalLink, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import MyEditorComponent from "../sections/MyEditorComponent";

const CreateActionTab = () => {
  const [code, setCode] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const { width, height } = useWindowSize();
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleUploadToIPFS = async () => {
    setIsUploading(true);
    setError(null);
    setIpfsHash(null);
    setShowConfetti(false);
    setIsCopied(false);
    setIsHighlighted(false);

    try {
      const hash = await uploadToIPFS(code);
      setIpfsHash(hash);
      setShowConfetti(true);
      setIsHighlighted(true);
      setTimeout(() => {
        setShowConfetti(false);
        setIsHighlighted(false);
      }, 5000);

      // Scroll to the bottom after a short delay to ensure the new content is rendered
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyHash = () => {
    if (ipfsHash) {
      navigator.clipboard.writeText(ipfsHash);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mt-4 bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg shadow-md">
        <a
          href="https://actions-docs.litprotocol.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-purple-700 hover:text-purple-900 transition-colors duration-200"
        >
          <span className="text-lg font-semibold">
            Lit Actions API Documentation
          </span>
          <ExternalLink className="h-5 w-5 ml-2" />
        </a>
      </div>

      <h3 className="text-xl font-semibold text-purple-800">Create Action</h3>

      <div className="h-[400px] border border-purple-200 rounded-lg overflow-hidden">
        <MyEditorComponent onCodeChange={handleCodeChange} />
      </div>

      <Button
        onClick={handleUploadToIPFS}
        disabled={isUploading || !code.trim()}
        className="w-full py-3 bg-gradient-to-r from-[#5732AD] to-[#3E298D] hover:from-[#6842BD] hover:to-[#4E399D] text-white text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isUploading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Uploading to IPFS...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Upload className="mr-2 h-6 w-6" />
            Upload to IPFS
          </span>
        )}
      </Button>

      <div ref={resultRef}>
        {ipfsHash && (
          <Alert
            className={`bg-green-50 border-green-200 ${
              isHighlighted ? "animate-pulse" : ""
            }`}
          >
            <AlertDescription className="text-green-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  🎉 Uploaded to IPFS successfully!
                </span>
                <a
                  href={`https://ipfs.io/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1 font-medium flex items-center"
                >
                  View on IPFS
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div
                className={`mt-2 flex items-center justify-between bg-white rounded-md p-2 ${
                  isHighlighted ? "ring-2 ring-purple-500" : ""
                }`}
              >
                <code className="text-sm text-purple-700">{ipfsHash}</code>
                <Button
                  onClick={handleCopyHash}
                  variant="ghost"
                  size="sm"
                  className="ml-2 hover:bg-purple-100"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-purple-500" />
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={["#C084FC", "#818CF8", "#38BDF8", "#4ADE80"]}
        />
      )}
    </div>
  );
};

export default CreateActionTab;
