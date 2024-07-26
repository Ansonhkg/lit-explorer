const uploadToIPFS = async (code: string): Promise<string> => {
  const res = await fetch("/api/lit-action/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const ipfsData = await res.json();

  console.log("ipfsData:", ipfsData);

  const cid = ipfsData.data.IpfsHash;

  return cid;
};

export default uploadToIPFS;
