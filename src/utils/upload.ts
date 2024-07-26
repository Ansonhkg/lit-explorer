const uploadToIPFS = async (code: string): Promise<string> => {
  try {
    const res = await fetch("/api/lit-action/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }

    const ipfsData = await res.json();

    console.log("ipfsData:", ipfsData);

    const cid = ipfsData.data.IpfsHash;

    return cid;
  } catch (e: any) {
    throw new Error(
      "❌ Failed to upload to IPFS: " + JSON.stringify(e.message)
    );
  }
};

export default uploadToIPFS;
