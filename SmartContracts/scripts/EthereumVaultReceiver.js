const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const EthereumVaultReceiver = await ethers.getContractFactory("EthereumVaultReceiver");
  const ethereumVaultReceiver = await EthereumVaultReceiver.deploy("0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", // router eth sepolia
    "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534", // weth token address
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    "0x08B618c6606841B2D59735208fB451208Ad6599E", // lidoAdapter
    "0x091b11C7bD09428fDe740e21Edad707F78691813", // rocketPoolAdapter
    "0x481C385DF5cDee3b306089fa20B9E3C08AB6C0b0" // staderAdapter
    ); 
  await ethereumVaultReceiver.deployed();


  return ethereumVaultReceiver.address;
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