const { ethers } = require("hardhat");

async function main() {
  const signer = await ethers.getSigner();

  const olstTokenAddress = "0xe9f7db18d961ae6875f8aa4c3546af8265181338";
  const burnerContractAddress = "0xe183376a59905ecDb90deA16FB29E481e44ff056";

  // ABI with grantBurnRole(address)
  const olstAbi = [
    "function grantBurnRole(address burner) external"
  ];

  const olst = new ethers.Contract(olstTokenAddress, olstAbi, signer);

  console.log("Granting burn role to:", burnerContractAddress);

  const tx = await olst.grantBurnRole(burnerContractAddress);
  await tx.wait();

  console.log("✅ Burn role granted successfully!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
