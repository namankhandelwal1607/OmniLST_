import React from 'react';
import { Droplet } from 'lucide-react';

export const HeroSection = () => {
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
          <div>
            <div className="text-4xl font-bold text-black tracking-wider">4.5%</div>
            <div className="text-gray-500 text-sm tracking-widest">Estimated APR</div>
          </div>

          <div>
            <div className="text-4xl font-bold text-black tracking-wider">$123,456,789</div>
            <div className="text-gray-500 text-sm tracking-widest">Total TVL</div>
          </div>
        </div>

        <button className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2">
          <Droplet className="w-5 h-5" />
          <span>Stake ETH</span>
        </button>
      </div>
    </div>
  );
};
