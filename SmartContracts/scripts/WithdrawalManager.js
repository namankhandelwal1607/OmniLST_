const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const WithdrawalManager = await ethers.getContractFactory("WithdrawalManager");
  const withdrawalManager = await WithdrawalManager.deploy(
    "0x08cdFC644aAfA4844481D7dA2e590ac98AFB0835", // stader
    "0x3De0bE54548218D9337dB01A5f283Ad3266ca4eB", // rocketPool
    "0x9f650e247f428298fdfF482a5c3287a2E1c38112", // lido
    "0x3C510684b27F1F947f8312204C7c419C998F7a23", // ccipSender
    ); 
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