const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const erc20Address = "0xe9f7db18d961ae6875f8aa4c3546af8265181338";
  const targetContractAddress = "0xda508d7b40e999b2382260E7fedfd9714D12eA13";

  const amountToApprove = ethers.BigNumber.from("100000000000000000000000000000000");
  const amountToMint = ethers.BigNumber.from("10000000000000000000000");

  // Minimal ERC20 ABI
  const erc20Abi = [
    "function approve(address spender, uint256 amount) public returns (bool)"
  ];

  // Connect to the ERC20 contract
  const erc20 = new ethers.Contract(erc20Address, erc20Abi, deployer);

  console.log("🔐 Approving tokens...");
  const tx1 = await erc20.approve(targetContractAddress, amountToApprove);
  await tx1.wait();
  console.log("✅ Approval successful");

  // Mint function ABI
  const targetAbi = [
    "function mint(uint256 amount) public"
  ];

  const targetContract = new ethers.Contract(targetContractAddress, targetAbi, deployer);

  console.log("🪙 Minting tokens...");
  const tx2 = await targetContract.mint(amountToMint);
  await tx2.wait();
  console.log("✅ Mint successful");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
