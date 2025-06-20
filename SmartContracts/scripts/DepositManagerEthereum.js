const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManagerEthereum = await ethers.getContractFactory("DepositManagerEthereum");
  const depositManagerEthereum = await DepositManagerEthereum.deploy(
    "0xe9f7db18d961ae6875f8aa4c3546af8265181338", // olst token
    "0x1ee5E76f6286E4D88b4400FC576c43Cf8d8Ce67A", // vault receiver
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    ); 
  await depositManagerEthereum.deployed();


  return depositManagerEthereum.address;
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