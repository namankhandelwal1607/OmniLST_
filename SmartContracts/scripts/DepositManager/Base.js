const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const depositManager = await DepositManager.deploy(
    "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // BaseRouter
    "0x9f650e247f428298fdff482a5c3287a2e1c38112", // Weth
    "0xa816Fd4ebB0e5a1B1241000acF14C53CBBbc4c87", // BaseCCIP
    "0x4d3BDE85c4c5860F37BEeB80C698E9C4414e2Df4", // EthereumVaultController
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    "0x1519660a238ab32170bf937a94ac5c46a946fa26", // omnitoken
    ); 
  await depositManager.deployed();


  return depositManager.address;
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