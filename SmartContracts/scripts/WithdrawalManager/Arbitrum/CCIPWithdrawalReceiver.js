const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const CCIPWithdrawalReceiver = await ethers.getContractFactory("CCIPWithdrawalReceiver");
  const cCIPWithdrawalReceiver = await CCIPWithdrawalReceiver.deploy(
    "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", // arbitrumSepoliaRouter
    "0xE591bf0A0CF924A0674d7792db046B23CEbF5f34", // weth address
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    ); 
  await cCIPWithdrawalReceiver.deployed();


  return cCIPWithdrawalReceiver.address;
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