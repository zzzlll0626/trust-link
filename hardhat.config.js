require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337 // 与MetaMask兼容的本地网络ID
    },
    // 可以添加其他网络配置
  },
  paths: {
    artifacts: './frontend/artifacts',
  },
};