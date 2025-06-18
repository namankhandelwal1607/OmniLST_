const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const CCIPSender = await ethers.getContractFactory("CCIPSender");
  const cCIPSender = await CCIPSender.deploy(
    "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // baseSepolia Router
    "0x1ee5E76f6286E4D88b4400FC576c43Cf8d8Ce67A", // EthereumVaultReceiver Address
    "16015286601757825753", // ethereumSepolia Selector
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // Owner
    ); 
  await cCIPSender.deployed();


  return cCIPSender.address;
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