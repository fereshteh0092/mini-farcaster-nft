const express = require("express");
const app = express();
const ethers = require("ethers");
const contractABI = require("../src/MiniFarcasterNFT.json"); // ABI جدید
const contractAddress = "0xEb4Faba396A9FF05620864B6b4C8f851f3261C2d"; // آدرس جدید

app.get("/", (req, res) => {
  const tokenId = req.query.tokenId || "1"; // Token ID پیش‌فرض
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://example.com/nft-image.jpg" /> <!-- یه تصویر NFT بذار -->
      <meta property="fc:frame:button:1" content="Mint NFT #${tokenId}" />
      <meta property="fc:frame:button:1:action" content="tx" />
      <meta property="fc:frame:button:1:target" content="${process.env.APP_URL}/mint?tokenId=${tokenId}" />
    </head>
    <body>
      <h1>NFT #${tokenId}</h1>
    </body>
    </html>
  `;
  res.send(html);
});

app.get("/mint", (req, res) => {
  const tokenId = req.query.tokenId;
  const txData = {
    chainId: "eip155:10143", // Monad Testnet Chain ID
    method: "eth_sendTransaction",
    params: {
      to: contractAddress,
      data: encodeMintData(tokenId),
      value: "0x0", // مقدار اولیه (قیمت بعداً محاسبه می‌شه)
    },
  };
  res.json(txData);
});

// تابع برای کدگذاری دیتای تراکنش مینت
function encodeMintData(tokenId) {
  const iface = new ethers.utils.Interface(contractABI);
  return iface.encodeFunctionData("mintNFT", [tokenId]);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frame server running on port ${port}`);
});