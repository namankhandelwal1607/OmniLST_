const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const CCIPSender = await ethers.getContractFactory("CCIPSender");
  const cCIPSender = await CCIPSender.deploy(
    "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", // arbitrumSepolia Router
    "0xe566FD759A60Da902699216Fab491733dC5159DE", // EthereumVaultReceiver Address
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