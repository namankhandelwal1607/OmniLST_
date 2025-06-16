const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const WithdrawalManager = await ethers.getContractFactory("WithdrawalManager");
  const withdrawalManager = await WithdrawalManager.deploy("0x08cdFC644aAfA4844481D7dA2e590ac98AFB0835");
  await withdrawalManager.deployed();


  return withdrawalManager.address;
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