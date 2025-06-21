const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const EthereumVaultReceiver = await ethers.getContractFactory("EthereumVaultReceiver");
  const ethereumVaultReceiver = await EthereumVaultReceiver.deploy(
    "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", // router eth sepolia
    "0x7ec523dd7367f0173c4a21de59afe823f16a11ee", // weth token address
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004", // owner
    "0x08B618c6606841B2D59735208fB451208Ad6599E", // lidoAdapter
    "0x091b11C7bD09428fDe740e21Edad707F78691813", // rocketPoolAdapter
    "0x481C385DF5cDee3b306089fa20B9E3C08AB6C0b0", // staderAdapter
    "0xc17475AE77d913C93cb1Adc0bB0AE69cfFCC89f2", // stETH
    "0x927379D1277de970F06BbFc93761565F3e50d7Ed", // rETH
    "0x78861580d0017990bC297ca344C23Bc10EAf9046", // lseth
    "0x6B23FDc54F0D552c9B1b3F34346566Ed59D0b1E9" // recipient
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