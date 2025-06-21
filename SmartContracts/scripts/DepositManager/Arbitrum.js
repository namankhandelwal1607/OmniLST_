const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const depositManager = await DepositManager.deploy(
    "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", // ArbitrumRouter
    "0xd41d95a821cd3aa2ae103465177322e2d33801ce", // Weth
    "0x481C385DF5cDee3b306089fa20B9E3C08AB6C0b0", // ArbitrumCCIP
    "0x1ee5E76f6286E4D88b4400FC576c43Cf8d8Ce67A", // EthereumVaultController
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    "0x2260313f6a27da8e7f9e86869e209cf8d36c564c", // omnitoken
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