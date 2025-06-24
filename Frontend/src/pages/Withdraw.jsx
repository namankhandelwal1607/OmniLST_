import React, { useState, useEffect } from "react";
import { Diamond } from "lucide-react";
import { ethers } from "ethers";
import abiWithdrawalManager from "../ABIs/WithdrawalManager.json";
import abiForwarder from "../ABIs/Forwarder.json";

const Withdraw = ({ state }) => {
  const [selectedChain, setSelectedChain] = useState("Ethereum");
  const [olstAmount, setOlstAmount] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);

  const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

const chainOptions = [
  {
    id: 'Ethereum',
    label: 'Stake via Ethereum',
    chainId: '0xaa36a7', // 11155111 in hex (Sepolia)
    rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    chainName: 'Ethereum Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  {
    id: 'Arbitrum',
    label: 'Stake via Arbitrum',
    chainId: '0x66eee', // 421614
    rpcUrls: [`https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
  },
  {
    id: 'Base',
    label: 'Stake via Base',
    chainId: '0x14a34', // 84532
    rpcUrls: [`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
];

useEffect(() => {
  const handleChainChanged = (chainIdHex) => {
    const match = chainOptions.find(c => c.chainId.toLowerCase() === chainIdHex.toLowerCase());
    if (match) setSelectedChain(match.id);
  };

  // On component mount: check initial chain
  if (window.ethereum) {
    handleChainChanged(window.ethereum.chainId);

    window.ethereum.on('chainChanged', handleChainChanged);
  }

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
}, []);

  const withdrawEthEthereum = async (parsedAmount, userAddress) => {
    try {
      console.log("🔥 Burning oLST on Ethereum..");

      // 1. Approve OLstBurn contract to spend oLST
      const oLSTTokenAddress = "0xe9f7db18d961ae6875f8aa4c3546af8265181338";
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];

      const tokenContract = new ethers.Contract(oLSTTokenAddress, erc20Abi, state.signer);

      console.log("🔑 Approving oLST spend before burn...");
      const txApprove = await tokenContract.approve(state.contractOLstBurnEthereum.address, parsedAmount);
      await txApprove.wait();
      console.log("✅ Approval complete");

      // 2. Burn oLST
      const tx1 = await state.contractOLstBurnEthereum.connect(state.signer).withdrawETH(parsedAmount);
      const receipt1 = await tx1.wait();
      console.log("✅ Burn transaction confirmed on Ethereum");

      // 3. Extract ETH returned from event logs
      const iface = new ethers.utils.Interface([
        "event Withdrawn(address indexed user, uint256 olstBurned, uint256 ethReturned)"
      ]);

      let ethReturned = null;
      for (const log of receipt1.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog.name === "Withdrawn") {
            ethReturned = parsedLog.args.ethReturned;
            console.log(`💰 ETH Returned from OLstBurn: ${ethers.utils.formatEther(ethReturned)} ETH`);
            break;
          }
        } catch (err) {
          // skip logs that don't match
        }
      }

      if (!ethReturned) {
        throw new Error("❌ Failed to extract ETH returned from burn event.");
      }

      await new Promise((r) => setTimeout(r, 500));

      // 4. Withdraw ETH on Sepolia from WithdrawalManager
      const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
      const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
      const sepoliaRpc = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      const sepProvider = new ethers.providers.JsonRpcProvider(sepoliaRpc);
      const wallet = new ethers.Wallet(PRIVATE_KEY, sepProvider);

      console.log("🛠 Sepolia wallet executing txs:", await wallet.getAddress());

      const contractWithdrawalManager = new ethers.Contract(
        state.contractWithdrawalManager.address,
        abiWithdrawalManager.abi,
        wallet
      );

      const tx2 = await contractWithdrawalManager.withdrawETH(
        ethReturned,
        40000,
        30000,
        ethers.utils.parseEther("1"),
        import.meta.env.VITE_Forwarder
      );
      await tx2.wait();
      console.log("✅ ETH withdrawal completed to Forwarder");

      // 5. Forward ETH to user
      const contractForwarder = new ethers.Contract(
        import.meta.env.VITE_Forwarder,
        abiForwarder.abi,
        wallet
      );

      const tx3 = await contractForwarder.forwarderEth(userAddress);
      await tx3.wait();
      console.log("✅ Forwarded ETH to:", userAddress);
    } catch (err) {
      console.error("❌ Error in withdrawEthEthereum:", err);
    }
  };


  const withdrawEthArbitrum = async (parsedAmount, userAddress) => {
    const oLSTTokenAddress = "0x2260313f6a27da8e7f9e86869e209cf8d36c564c";
    const erc20Abi = [
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];

    const tokenContract = new ethers.Contract(oLSTTokenAddress, erc20Abi, state.signer);

    console.log("🔑 Approving oLST spend before burn...");
    const txApprove = await tokenContract.approve(state.contractOLstBurnArbitrum.address, parsedAmount);
    await txApprove.wait();
    console.log("✅ Approval complete");

    console.log("🔥 Burning oLST on Arbitrum...");
    console.log(parsedAmount.toString());
    const tx1 = await state.contractOLstBurnArbitrum.connect(state.signer).withdrawETH(parsedAmount);
    const receipt1 = await tx1.wait(); // <-- Wait for receipt
    console.log("✅ Burn transaction confirmed on Arbitrum");

    // 🔍 Extract ETH returned from logs
    const iface = new ethers.utils.Interface([
      "event Withdrawn(address indexed user, uint256 olstBurned, uint256 ethReturned)"
    ]);

    let ethReturned = null;
    for (const log of receipt1.logs) {
      try {
        const parsedLog = iface.parseLog(log);
        if (parsedLog.name === "Withdrawn") {
          ethReturned = parsedLog.args.ethReturned;
          console.log(`💰 ETH Returned from OLstBurn: ${ethers.utils.formatEther(ethReturned)} ETH`);
          break;
        }
      } catch (err) {
        // Not the correct event, continue
      }
    }


    await new Promise((r) => setTimeout(r, 500));

    const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
    const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
    const sepoliaRpc = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    const sepProvider = new ethers.providers.JsonRpcProvider(sepoliaRpc);
    const wallet = new ethers.Wallet(PRIVATE_KEY, sepProvider);
    console.log("🛠 Sepolia wallet executing txs:", await wallet.getAddress());

    const contractWithdrawalManager = new ethers.Contract(
      state.contractWithdrawalManager.address,
      abiWithdrawalManager.abi,
      wallet
    );
    const tx2 = await contractWithdrawalManager.withdrawETH(
      ethReturned,
      40000,
      30000,
      ethers.utils.parseEther("1"),
      import.meta.env.VITE_Forwarder
    );
    await tx2.wait();
    console.log("✅ ETH withdrawal completed to Forwarder");


    const contractForwarder = new ethers.Contract(
      import.meta.env.VITE_Forwarder,
      abiForwarder.abi,
      wallet
    );
    const tx3 = await contractForwarder.forward(userAddress);
    await tx3.wait();
    console.log("✅ Forwarded ETH via CCIP to:", userAddress);
  };

  const withdrawEthBase = async (parsedAmount, userAddress) => {
    try {
      console.log("🔥 Burning oLST on Base...");

      const oLSTTokenAddress = "0x1519660a238ab32170bf937a94ac5c46a946fa26";
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];

      const tokenContract = new ethers.Contract(oLSTTokenAddress, erc20Abi, state.signer);

      console.log("🔑 Approving oLST spend before burn...");
      const txApprove = await tokenContract.approve(state.contractOLstBurnBase.address, parsedAmount);
      await txApprove.wait();
      console.log("✅ Approval complete");

      const tx1 = await state.contractOLstBurnBase.connect(state.signer).withdrawETH(parsedAmount);
      const receipt1 = await tx1.wait(); // ✅ FIXED
      console.log("✅ Burn transaction confirmed on Base");

      // 🔍 Extract ETH returned from logs
      const iface = new ethers.utils.Interface([
        "event Withdrawn(address indexed user, uint256 olstBurned, uint256 ethReturned)"
      ]);

      let ethReturned = null;
      for (const log of receipt1.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog.name === "Withdrawn") {
            ethReturned = parsedLog.args.ethReturned;
            console.log(`💰 ETH Returned from OLstBurn: ${ethers.utils.formatEther(ethReturned)} ETH`);
            break;
          }
        } catch (err) {
          // Not the correct event, continue
        }
      }

      if (!ethReturned) {
        throw new Error("❌ Could not extract ethReturned from OLstBurn logs.");
      }


      await new Promise((r) => setTimeout(r, 500));

      const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
      const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
      const sepoliaRpc = `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      const sepProvider = new ethers.providers.JsonRpcProvider(sepoliaRpc);
      const wallet = new ethers.Wallet(PRIVATE_KEY, sepProvider);

      console.log("🛠 Sepolia wallet executing txs:", await wallet.getAddress());

      const BASE_PAYOUT = import.meta.env.VITE_BASE_PAYOUT;

      const basePayoutAbi = [
        "function payout(address recipient, uint256 amount) external"
      ];

      const basePayoutContract = new ethers.Contract(BASE_PAYOUT, basePayoutAbi, wallet);

      console.log(`🚀 Sending ${ethers.utils.formatEther(ethReturned)} ETH to ${userAddress} from BasePayoutVault...`);

      const tx2 = await basePayoutContract.payout(userAddress, ethReturned);
      await tx2.wait();

      console.log("✅ ETH transferred successfully to user!");
    } catch (error) {
      console.error("❌ Error in withdrawEthBase:", error);
    }
  };

  const switchChain = async (option) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: option.chainId }],
      });
    } catch (switchError) {
      // This error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: option.chainId,
              chainName: option.chainName,
              rpcUrls: option.rpcUrls,
              nativeCurrency: option.nativeCurrency,
              blockExplorerUrls: option.blockExplorerUrls,
            }],
          });
        } catch (addError) {
          console.error('Error adding chain', addError);
        }
      } else {
        console.error('Error switching chain', switchError);
      }
    }

    setSelectedChain(option.id);
  };


  const handleWithdraw = async () => {
    if (!state.signer || !olstAmount) return;

    try {
      setTxPending(true);
      setWithdrawResult(null);

      const parsedAmount = ethers.utils.parseEther(olstAmount);
      console.log("Parsed amount ", ethers.utils.formatEther(parsedAmount));
      const userAddress = await state.signer.getAddress();
      console.log("🔑 User initiating withdrawal:", userAddress);

      if (selectedChain === "Ethereum") {
        await withdrawEthEthereum(parsedAmount, userAddress);
      } else if (selectedChain === "Arbitrum") {
        await withdrawEthArbitrum(parsedAmount, userAddress);
      } else if (selectedChain === "Base") {
        await withdrawEthBase(parsedAmount, userAddress);
      }

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
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Redeem oLST for ETH</h1>
        <p className="text-gray-400 text-lg">
          Burn oLST and receive ETH on the original chain.
        </p>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-lg">
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Network</label>
        <div className="grid grid-cols-3 gap-2 bg-gray-800 rounded-xl p-1 mb-6">
          {chainOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => switchChain(option)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition ${selectedChain === option.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
            >
              {option.id}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="text-white font-medium mb-1">
            {chainOptions.find((c) => c.id === selectedChain)?.label}
          </div>
        </div>

        <div className="mb-6 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Diamond className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300 font-medium">oLST</span>
          </div>
          <input
            type="number"
            value={olstAmount}
            onChange={(e) => setOlstAmount(e.target.value)}
            placeholder="0.0"
            className="w-full pl-20 pr-20 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button
            onClick={() => setOlstAmount("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-md hover:bg-blue-500/30 transition"
          >
            MAX
          </button>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!olstAmount || txPending}
          className={`w-full py-4 font-semibold rounded-xl transition ${olstAmount && !txPending
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          {txPending ? "Processing..." : "Withdraw ETH"}
        </button>

        {withdrawResult && (
          <div className="mt-6 text-sm text-gray-300 border-t border-gray-700 pt-4 space-y-2">
            <div>
              <span className="font-medium text-white">User:</span> {withdrawResult.user}
            </div>
            <div>
              <span className="font-medium text-white">ETH Redeemed:</span>{" "}
              {withdrawResult.amount} ETH
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
