const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const LidoAdapter = await ethers.getContractFactory("LidoAdapter");
  const lidoAdapter = await LidoAdapter.deploy("0x9f650e247f428298fdfF482a5c3287a2E1c38112");
  await lidoAdapter.deployed();


  return lidoAdapter.address;
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