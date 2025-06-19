import React, { useEffect, useState } from 'react';
import { Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';

export const HeroSection = ({ state }) => {
  const navigate = useNavigate();
  const [tvlEth, setTvlEth] = useState(null);
  const [tvlUsd, setTvlUsd] = useState(null);

  useEffect(() => {
    const fetchTVL = async () => {
      try {
        const provider = state?.provider?.ethereum;
        if (!provider) return;

        const contractAddresses = [
          import.meta.env.VITE_MockLido,
          import.meta.env.VITE_MockRocketPool,
          import.meta.env.VITE_MockStader
        ];

        let totalEth = 0;

        for (const addr of contractAddresses) {
          if (!addr) continue;
          const balance = await provider.getBalance(addr);
          const formatted = parseFloat(ethers.utils.formatEther(balance));
          console.log(`Balance of ${addr}: ${formatted} ETH`);
          totalEth += formatted;
        }

        setTvlEth(totalEth);

        const res = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const ethUsd = res.data.ethereum.usd;
        const totalUsd = totalEth * ethUsd;

        setTvlUsd(totalUsd.toFixed(2));
      } catch (err) {
        console.error("TVL fetch error:", err);
      }
    };

    fetchTVL();
  }, [state]);

  return (
    <div className="flex-1 flex items-center justify-center px-8 max-w-2xl">
      <div className="text-left w-full">
        <h1 className="text-7xl font-light text-black leading-tight mb-6 tracking-wide">
          Cross-chain<br />
          staking with<br />
          <span className="font-bold tracking-wider">oLST</span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 font-light tracking-wide">
          Unified access to stETH, rETH, LsETH and more — from one synthetic token
        </p>

        <div className="flex items-center space-x-12 mb-8">
          {/* <div>
            <div className="text-4xl font-bold text-black tracking-wider">4.5%</div>
            <div className="text-gray-500 text-sm tracking-widest">Estimated APR</div>
          </div> */}

          <div>
            <div className="text-4xl font-bold text-black tracking-wider">
              {tvlUsd ? `$${tvlUsd}` : 'Loading...'}
            </div>
            <div className="text-gray-500 text-sm tracking-widest">
              Total TVL {tvlEth && `(${tvlEth.toFixed(4)} ETH)`}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/stake')}
          className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <Droplet className="w-5 h-5" />
          <span>Stake ETH</span>
        </button>
      </div>
    </div>
  );
};
