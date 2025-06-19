import React, { useState } from 'react';
import {
  Droplets,
  Diamond,
  TrendingUp,
  Shield,
  Info
} from 'lucide-react';
import { ethers } from 'ethers';

const Stake = ({ state }) => {
  const [selectedOption, setSelectedOption] = useState('Ethereum');
  const [ethAmount, setEthAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [txPending, setTxPending] = useState(false);

  const options = [
    { id: 'Ethereum', label: 'Standard Staking', apr: '5.7%', description: 'Regular ETH staking with stETH rewards' },
    { id: 'Arbitrum', label: 'Boosted Staking', apr: '6.2%', description: 'Enhanced rewards with Mellow points' },
    { id: 'Base', label: 'Premium Staking', apr: '7.1%', description: 'Maximum rewards with bonus multipliers' }
  ];

  const handleStake = async () => {
    if (!state.signer || !ethAmount) return;

    try {
      setTxPending(true);

      let contract;
      if (selectedOption === 'Ethereum') {
        contract = state.contractDepositManagerEthereum;
      } else if (selectedOption === 'Arbitrum') {
        contract = state.contractDepositManagerArbitrum;
      } else if (selectedOption === 'Base') {
        contract = state.contractDepositManagerBase;
      }

      const parsedAmount = ethers.utils.parseEther(ethAmount);
      const exchangeRate = 1;

      const tx = await contract.connect(state.signer).depositETH(exchangeRate, {
        value: parsedAmount,
      });

      await tx.wait();

      alert("ETH successfully staked!");
      setEthAmount('');
    } catch (err) {
      console.error("Staking error:", err);
      alert("Transaction failed!");
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Stake Ether</h1>
        <p className="text-gray-400 text-lg">Stake ETH and receive stETH while staking</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Select Staking Option</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-900/50 rounded-xl">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedOption === option.id
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {option.id}
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">
                {options.find(opt => opt.id === selectedOption)?.label}
              </span>
              <span className="text-sky-400 font-bold">
                {options.find(opt => opt.id === selectedOption)?.apr} APR
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {options.find(opt => opt.id === selectedOption)?.description}
            </p>
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
            className="w-full pl-20 pr-20 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all duration-200"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-sky-500/20 text-sky-400 text-sm font-medium rounded-md hover:bg-sky-500/30 transition-all duration-200">
            MAX
          </button>
        </div>

        {!isConnected ? (
          <button
            onClick={() => setIsConnected(true)}
            className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            Connect wallet
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={!ethAmount || txPending}
            className={`w-full py-4 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
              ethAmount && !txPending
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {txPending ? 'Processing...' : ethAmount ? 'Proceed' : 'Enter amount'}
          </button>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-sky-500/10 to-blue-600/10 rounded-xl border border-sky-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-sky-400" />
            <span className="text-white font-semibold">
              Total {options.find(opt => opt.id === selectedOption)?.apr} APR + Mellow points
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            {selectedOption === 'Ethereum' && 'New way to support Lido decentralization.'}
            {selectedOption === 'Arbitrum' && 'Enhanced rewards with additional protocol benefits.'}
            {selectedOption === 'Base' && 'Premium tier with maximum earning potential.'}
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <Droplets className="h-4 w-4 text-sky-400" />
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">stETH, Obol, SSV APR</span>
            </div>
            <span className="text-gray-500">+</span>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="text-gray-300">Mellow points</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700/30 text-xs text-gray-500">
            Not financial advice. Info and APR are illustrative, actual rewards may vary.
          </div>
        </div>

        {isConnected && ethAmount && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">You will receive</span>
              <span className="text-white font-medium">{ethAmount} stETH</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Exchange rate</span>
              <span className="text-white font-medium">1 ETH = 1 stETH</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Max transaction cost</span>
              <span className="text-white font-medium">$0.75</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">Reward fee</span>
                <Info className="h-3 w-3 text-gray-500" />
              </div>
              <span className="text-white font-medium">10%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stake;
