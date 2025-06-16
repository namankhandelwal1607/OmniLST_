const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const MockStader = await ethers.getContractFactory("MockStader");
  const mockStader = await MockStader.deploy();
  await mockStader.deployed();


  return mockStader.address;
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