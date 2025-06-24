import React, { useState, useEffect } from 'react';
import { Diamond, Info } from 'lucide-react';
import { ethers } from 'ethers';

const Stake = ({ state }) => {
  const [selectedChain, setSelectedChain] = useState('Ethereum');
  const [ethAmount, setEthAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [txPending, setTxPending] = useState(false);
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


  const handleStake = async () => {
    if (!state.signer || !ethAmount) return;

    try {
      setTxPending(true);

      let contract;
      if (selectedChain === 'Ethereum') contract = state.contractDepositManagerEthereum;
      if (selectedChain === 'Arbitrum') contract = state.contractDepositManagerArbitrum;
      if (selectedChain === 'Base') contract = state.contractDepositManagerBase;

      const parsedAmount = ethers.utils.parseEther(ethAmount); // e.g., 1 ETH = 1e18 wei
      const exchangeRate = ethers.BigNumber.from("1");         // 1 wei = 1 oLST
      const tx = await contract.connect(state.signer).depositETH(exchangeRate, {
        value: parsedAmount,
      });


      await tx.wait();
      alert("Staking successful!");
      setEthAmount('');
    } catch (err) {
      console.error("Staking error:", err);
      alert("Transaction failed!");
    } finally {
      setTxPending(false);
    }
  };

  // oLST calculation based on exchange rate (1:1 here)
  const olstAmount =
    ethAmount && !isNaN(ethAmount)
      ? (parseFloat(ethAmount) * 1000).toFixed(6) // 1 ETH = 1000 oLST
      : '0.0';


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

  return (
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Stake ETH for oLST</h1>
        <p className="text-gray-400 text-lg">
          Deposit ETH to mint oLST backed by stETH, rETH, or LsETH across chains.
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
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              {option.id}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="text-white font-medium mb-1">
            {chainOptions.find(c => c.id === selectedChain)?.label}
          </div>
          <div className="text-sm text-gray-400">
            {/* APR: {chainOptions.find(c => c.id === selectedChain)?.apr} */}
          </div>
        </div>

        <div className="mb-6 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Diamond className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300 font-medium">ETH</span>
          </div>
          <input
            type="number"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0.0"
            className="w-full pl-20 pr-20 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onClick={() => setEthAmount('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-md hover:bg-blue-500/30 transition"
          >
            MAX
          </button>

          {/* Live oLST Preview */}
          {ethAmount && parseFloat(ethAmount) > 0 && (
            <div className="text-sm text-gray-400 mt-2 pl-1">
              You will receive: <span className="text-white font-medium">{olstAmount} oLST</span>
            </div>
          )}
        </div>

        {!isConnected ? (
          <button
            onClick={() => setIsConnected(true)}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={!ethAmount || txPending}
            className={`w-full py-4 font-semibold rounded-xl transition ${ethAmount && !txPending
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {txPending ? 'Processing...' : 'Stake ETH'}
          </button>
        )}

        {isConnected && ethAmount && (
          <div className="mt-6 space-y-3 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Exchange rate</span>
              <span>1 ETH = 1000 oLST</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated APR</span>
              <span>{chainOptions.find(c => c.id === selectedChain)?.apr}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center space-x-1">
                <span>Platform fee</span>
                <Info className="h-4 w-4 text-gray-500" />
              </span>
              <span>0.5%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stake;
