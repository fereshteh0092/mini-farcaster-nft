require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    monadTestnet: {
      url: "https://monad-rpc-01.inc1.cloud",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};