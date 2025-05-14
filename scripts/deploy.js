const hre = require("hardhat");

async function main() {
  const MiniFarcasterNFT = await hre.ethers.getContractFactory("MiniFarcasterNFT");
  const miniFarcasterNFT = await MiniFarcasterNFT.deploy();

  await miniFarcasterNFT.deployed();
  console.log("MiniFarcasterNFT deployed to:", miniFarcasterNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});