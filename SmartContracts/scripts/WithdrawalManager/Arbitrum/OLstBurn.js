const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const OLstBurn = await ethers.getContractFactory("OLstBurn");
  const oLstBurn = await OLstBurn.deploy(
    "0x2260313f6a27da8e7f9e86869e209cf8d36c564c", // olstToken address
    ); 
  await oLstBurn.deployed();


  return oLstBurn.address;
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