// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // 获取合约工厂
  const TrustLinkLending = await hre.ethers.getContractFactory("TrustLinkLending");
  const CreditSystem = await hre.ethers.getContractFactory("CreditSystem");
  const DefaultHandler = await hre.ethers.getContractFactory("DefaultHandler");
  const FundManager = await hre.ethers.getContractFactory("FundManager");

  // 部署合约
  console.log("正在部署 TrustLinkLending...");
  const lending = await TrustLinkLending.deploy();
  // 在最新版Hardhat中，应该使用以下方式等待部署完成
  await lending.waitForDeployment();
  // 获取合约地址的方式也可能不同
  const lendingAddress = await lending.getAddress();
  console.log("TrustLinkLending 已部署到:", lendingAddress);

  console.log("正在部署 CreditSystem...");
  const credit = await CreditSystem.deploy();
  await credit.waitForDeployment();
  const creditAddress = await credit.getAddress();
  console.log("CreditSystem 已部署到:", creditAddress);

  console.log("正在部署 DefaultHandler...");
  const defaultHandler = await DefaultHandler.deploy();
  await defaultHandler.waitForDeployment();
  const defaultHandlerAddress = await defaultHandler.getAddress();
  console.log("DefaultHandler 已部署到:", defaultHandlerAddress);

  console.log("正在部署 FundManager...");
  const fundManager = await FundManager.deploy();
  await fundManager.waitForDeployment();
  const fundManagerAddress = await fundManager.getAddress();
  console.log("FundManager 已部署到:", fundManagerAddress);

  // 保存部署信息到文件，便于前端使用
  const fs = require("fs");
  const deploymentInfo = {
    lendingAddress: lendingAddress,
    creditAddress: creditAddress,
    defaultHandlerAddress: defaultHandlerAddress,
    fundManagerAddress: fundManagerAddress,
    chainId: hre.network.config.chainId
  };

  // 确保目录存在
  if (!fs.existsSync("./frontend/js")) {
    fs.mkdirSync("./frontend/js", { recursive: true });
  }

  fs.writeFileSync("./frontend/js/deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("部署信息已保存到 ./frontend/js/deployment.json");
}

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });