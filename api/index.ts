import express from "express";
import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";
import { PINATA_PIN_NAME } from "../src/shared";
import cors from "cors";

const API = process.env.PINATA_API ?? "";
const SECRET = process.env.PINATA_SECRET ?? "";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

console.log(`📍 Pinata Pin Name: "${PINATA_PIN_NAME}"`);
console.log(`🌐 Allowed Origins: ${ALLOWED_ORIGINS.join(", ")}`);

if (!API || !SECRET) {
  console.error(
    `❌ Please provide your Pinata API key and secret by setting the PINATA_API and PINATA_SECRET environment variables.`
  );
  process.exit(1);
}

const app = express();

// Strict CORS configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Check if the origin is in the allowed list
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

// Apply CORs
app.use((req, res, next) => {
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      // Store the CORS error in the request object
      req.corsError = err;
    }
    next();
  });
});

// Add middleware to parse JSON bodies
app.use(express.json());

// Custom middleware to handle CORS errors
app.use((req, res, next) => {
  if (req.corsError) {
    res.status(403).json({
      error: "CORS Error",
      message: req.corsError.message,
    });
  } else {
    next();
  }
});

app.post("/api/lit-action/upload", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Missing 'code' in request body" });
  }

  const pinata = new pinataSDK(API, SECRET);

  const pinStringToIPFS = async (string: string) => {
    try {
      const buffer = Buffer.from(string, "utf8");
      const stream = Readable.from(buffer);

      // @ts-ignore
      stream.path = "string.txt";

      const result = await pinata.pinFileToIPFS(stream, {
        pinataMetadata: { name: PINATA_PIN_NAME },
      });
      return { status: 200, data: result };
    } catch (error) {
      console.error("Error pinning to IPFS:", error);
      return { status: 500, error: "Failed to pin to IPFS" };
    }
  };

  try {
    const result = await pinStringToIPFS(code);
    console.log("IPFS upload result:", result);

    if (result.status === 200) {
      res.json({ message: "Successfully uploaded to IPFS", data: result.data });
    } else {
      res.status(result.status).json({ error: result.error });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
  console.log(`🔥 API server is running on http://localhost:${PORT}`);
});
