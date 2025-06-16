const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const RocketPoolAdapter = await ethers.getContractFactory("RocketPoolAdapter");
  const rocketPoolAdapter = await RocketPoolAdapter.deploy("0x3De0bE54548218D9337dB01A5f283Ad3266ca4eB");
  await rocketPoolAdapter.deployed();


  return rocketPoolAdapter.address;
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