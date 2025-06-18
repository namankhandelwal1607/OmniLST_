const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const depositManager = await DepositManager.deploy(
    "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // BaseRouter
    "0x4200000000000000000000000000000000000006", // Weth
    "0xc3Ad58C9e0322047D5eA8847a3772B0fed0D2e79", // BaseCCIP
    "0x1ee5E76f6286E4D88b4400FC576c43Cf8d8Ce67A", // EthereumVaultController
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    "0x1519660a238ab32170bf937a94ac5c46a946fa26", // omnitoken
    ); 
  await depositManager.deployed();


  return depositManager.address;
}

main()
  .then(address => {
    console.log(`address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });