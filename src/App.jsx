import { useState } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./contract";
import { Buffer } from "buffer";
import axios from "axios";
import FormData from "form-data";
import "./App.css";

window.Buffer = Buffer;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [supply, setSupply] = useState("");
  const [price, setPrice] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mintLink, setMintLink] = useState(""); // برای ذخیره لینک مینت

  // کلیدهای جدید پیناتا
  const pinataApiKey = "f9a85bdca01d7c16ccae";
  const pinataSecretApiKey = "fab3f47da8ee75cc6c39fa80cd80c3f6b876422da53d135bf4317aa41aa0fd8f";

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("Please install MetaMask!");
      return;
    }

    try {
      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Accounts:", accounts);
      setAccount(accounts[0]);
      setStatus(
        "Wallet connected: " +
          accounts[0] +
          ". Please make sure you are connected to Monad Testnet (Chain ID: 10143)."
      );

      console.log("Setting up provider...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("Provider:", provider);

      console.log("Getting signer...");
      const signer = provider.getSigner();
      console.log("Signer:", signer);

      console.log("Contract Address:", contractAddress);
      console.log("Contract ABI:", contractABI);
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      console.log("Contract instance set:", contractInstance);
      setContract(contractInstance);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setStatus("Error connecting wallet: " + error.message);
    }
  };

  const uploadToPinata = async (file) => {
    if (!file) {
      throw new Error("No file selected");
    }

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": `multipart/form-data`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });
      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  };

  const createNFT = async () => {
    if (!contract) {
      setStatus("Please connect wallet first!");
      return;
    }

    if (!name || !supply || !price || !file) {
      setStatus("Please fill in all fields and upload an image!");
      return;
    }

    if (isCreating) {
      setStatus("Please wait, NFT creation in progress...");
      return;
    }

    setIsCreating(true);
    try {
      setStatus("Uploading image to Pinata...");
      const tokenURI = await uploadToPinata(file);
      console.log("Token URI:", tokenURI);

      await delay(2000);

      setStatus("Creating NFT...");
      console.log("Creating NFT with:", { name, supply, price, tokenURI });
      const tx = await contract.createNFT(
        name,
        supply,
        ethers.utils.parseEther(price.toString()),
        tokenURI
      );
      console.log("Transaction sent:", tx);
      await tx.wait();

      // گرفتن Token ID از تراکنش (nextTokenId - 1)
      const nextTokenId = await contract.nextTokenId();
      const newTokenId = nextTokenId.toNumber() - 1;

      // تولید لینک مینت
      const mintUrl = `${window.location.origin}?tokenId=${newTokenId}`;
      setMintLink(mintUrl);

      setStatus(`NFT created! Transaction: ${tx.hash}\nMint Link: ${mintUrl}`);
    } catch (error) {
      console.error("Error creating NFT:", error);
      setStatus("Error creating NFT: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const mintNFT = async () => {
    if (!contract) {
      setStatus("Please connect wallet first!");
      return;
    }

    if (!tokenId) {
      setStatus("Please enter a Token ID!");
      return;
    }

    try {
      console.log("Fetching NFT with tokenId:", tokenId);
      const nft = await contract.getNFT(tokenId);
      console.log("NFT data:", nft);
      const tx = await contract.mintNFT(tokenId, {
        value: nft.price,
      });
      console.log("Mint transaction sent:", tx);
      await tx.wait();
      setStatus("NFT minted! Transaction: " + tx.hash);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setStatus("Error minting NFT: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="App">
      <h1>Mini Farcaster NFT</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p style={{ whiteSpace: "pre-wrap" }}>{status}</p>

      <h2>Create NFT</h2>
      <input
        type="text"
        placeholder="NFT Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Supply"
        value={supply}
        onChange={(e) => setSupply(e.target.value)}
      />
      <input
        type="text"
        placeholder="Price (MON)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button onClick={createNFT} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create NFT"}
      </button>

      {mintLink && (
        <div>
          <h3>Share this Mint Link:</h3>
          <a href={mintLink} target="_blank" rel="noopener noreferrer">
            {mintLink}
          </a>
        </div>
      )}

      <h2>Mint NFT</h2>
      <input
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <button onClick={mintNFT}>Mint NFT</button>
    </div>
  );
}

export default App;