const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const BasePayoutVault = await ethers.getContractFactory("BasePayoutVault");
  const basePayoutVault = await BasePayoutVault.deploy(); 
  await basePayoutVault.deployed();


  return basePayoutVault.address;
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