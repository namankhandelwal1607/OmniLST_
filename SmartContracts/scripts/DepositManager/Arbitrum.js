const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const depositManager = await DepositManager.deploy(
    "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", // ArbitrumRouter
    "0xE591bf0A0CF924A0674d7792db046B23CEbF5f34", // Weth
    "0xF27bB064e75bAA84803D4aB590AC2FcA60B0b894", // ArbitrumCCIP
    "0xe566FD759A60Da902699216Fab491733dC5159DE", // EthereumVaultController
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