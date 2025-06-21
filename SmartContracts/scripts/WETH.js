const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const WETH = await ethers.getContractFactory("WETH");
  const wETH = await WETH.deploy("0x8158C9c9e66d1170BEaC5395A68F68c88E456004"); 
  await wETH.deployed();


  return wETH.address;
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