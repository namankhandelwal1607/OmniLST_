const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const OsLSTToken = await ethers.getContractFactory("OsLSTToken");
  const osLSTToken = await OsLSTToken.deploy(
    ethers.utils.parseUnits("1000000000000000", 18), // safer large value
    ethers.utils.parseEther("1"), // 1 ETH
    "0x8158C9c9e66d1170BEaC5395A68F68c88E456004"
  );

  await osLSTToken.deployed();
  console.log(`address: ${osLSTToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
