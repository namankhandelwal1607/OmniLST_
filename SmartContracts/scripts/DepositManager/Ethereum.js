const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const depositManager = await DepositManager.deploy(
    "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", // EthereumRouter
    "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534", // Weth
    "0x00176bFBEca48f6Eae0c05C400309766f5eAF7e0", // EthereumCCIP
    "0x1ee5E76f6286E4D88b4400FC576c43Cf8d8Ce67A", // EthereumVaultController
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    "0xe9f7db18d961ae6875f8aa4c3546af8265181338", // omnitoken
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