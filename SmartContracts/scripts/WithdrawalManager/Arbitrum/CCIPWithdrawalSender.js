const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const CCIPWithdrawalSender = await ethers.getContractFactory("CCIPWithdrawalSender");
  const cCIPWithdrawalSender = await CCIPWithdrawalSender.deploy(
    "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", // eth sepolia router
    "0x058D4f73E265D91842F1E4A9a721afF6cbE2ff4F", //  CCIPWithdrawalReceiver
    "3478487238524512106", // Arbitrum selector
    "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534", //eth sepolia weth
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004" // owner address
    ); 
  await cCIPWithdrawalSender.deployed();


  return cCIPWithdrawalSender.address;
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