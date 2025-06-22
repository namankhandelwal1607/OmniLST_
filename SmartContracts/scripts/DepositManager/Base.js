const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const depositManager = await DepositManager.deploy(
    "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // BaseRouter
    "0x2f8c66a81de13d4db44166f162f516937db284ad", // Weth
    "0xEaeEf56650b0E31Cc71B351c70f2bb7B762A7b70", // BaseCCIP
    "0x261ba9F01b075066946c7Aba074eC1674a4AdB84", // EthereumVaultController
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