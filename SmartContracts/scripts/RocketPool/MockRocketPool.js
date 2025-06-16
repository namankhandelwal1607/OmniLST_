const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const MockRocketPool = await ethers.getContractFactory("MockRocketPool");
  const mockRocketPool = await MockRocketPool.deploy();
  await mockRocketPool.deployed();


  return mockRocketPool.address;
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