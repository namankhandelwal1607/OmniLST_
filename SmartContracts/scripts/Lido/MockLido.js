const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const MockLido = await ethers.getContractFactory("MockLido");
  const mockLido = await MockLido.deploy();
  await mockLido.deployed();


  return mockLido.address;
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