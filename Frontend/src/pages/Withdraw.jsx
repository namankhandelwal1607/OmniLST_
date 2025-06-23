import React, { useState } from "react";
import { ethers } from "ethers";
import abiWithdrawalManager from "../ABIs/WithdrawalManager.json";
import abiForwarder from "../ABIs/Forwarder.json";

const Withdraw = ({ state }) => {
  const [olstAmount, setOlstAmount] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);

  const handleWithdraw = async () => {
    if (!state.signer || !olstAmount) return;

    try {
      setTxPending(true);
      setWithdrawResult(null);
      const parsedAmount = ethers.utils.parseEther(olstAmount);

      // ✅ Get original user address from MetaMask (Arbitrum)
      const userAddress = await state.signer.getAddress();
      console.log("🔑 User initiating withdrawal:", userAddress);

      // ✅ Step 1: Burn oLST on Arbitrum
      console.log("🔥 Burning oLST on Arbitrum...");
      const tx1 = await state.contractOLstBurn.connect(state.signer).withdrawETH(parsedAmount);
      await tx1.wait();
      console.log("✅ Burn transaction confirmed on Arbitrum");

      // ✅ Delay before Sepolia interaction
      await new Promise((r) => setTimeout(r, 500));

      // ✅ Use private key to interact on Sepolia
      const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
      const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
      const sepoliaRpc = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      const sepProvider = new ethers.providers.JsonRpcProvider(sepoliaRpc);
      const wallet = new ethers.Wallet(PRIVATE_KEY, sepProvider);
      console.log("🛠 Sepolia wallet executing txs:", await wallet.getAddress());

      // ✅ Withdraw ETH to Forwarder on Sepolia
      const contractWithdrawalManager = new ethers.Contract(
        state.contractWithdrawalManager.address,
        abiWithdrawalManager.abi,
        wallet
      );

      const tx2 = await contractWithdrawalManager.withdrawETH(
        parsedAmount,
        40000, // % Lido
        30000, // % Rocket Pool
        ethers.utils.parseEther("1"), // rate (1 oLST = 1 ETH)
        import.meta.env.VITE_Forwarder // Forwarder address
      );
      await tx2.wait();
      console.log("✅ ETH withdrawal completed, sent to Forwarder");

      // ✅ Forward ETH using original burner's address
      const contractForwarder = new ethers.Contract(
        import.meta.env.VITE_Forwarder,
        abiForwarder.abi,
        wallet
      );

      const tx3 = await contractForwarder.forward(userAddress);
      await tx3.wait();
      console.log("✅ Forwarder sent ETH via CCIP to:", userAddress);

      setWithdrawResult({
        user: userAddress,
        amount: ethers.utils.formatEther(parsedAmount),
      });
    } catch (err) {
      console.error("Withdraw error:", err);
      alert("Withdraw failed: " + (err.reason || err.message));
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-16 pb-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Withdraw ETH (Burn oLST)</h1>

      <div className="bg-gray-900 p-6 rounded-xl shadow border border-gray-700 space-y-6">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Enter oLST Amount</label>
          <input
            type="number"
            placeholder="0.0"
            value={olstAmount}
            onChange={(e) => setOlstAmount(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none border border-gray-600 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!olstAmount || txPending}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            olstAmount && !txPending
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {txPending ? "Processing..." : "Withdraw ETH"}
        </button>

        {withdrawResult && (
          <div className="mt-4 text-sm text-gray-300 border-t border-gray-700 pt-4 space-y-2">
            <div>
              <span className="font-medium text-white">User:</span> {withdrawResult.user}
            </div>
            <div>
              <span className="font-medium text-white">ETH Redeemed:</span> {withdrawResult.amount} ETH
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
