import React from 'react';
import { ChevronDown, ArrowRight, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProcessSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex items-center justify-center px-8 py-16">
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-0 items-center">
          
          {/* Stake ETH */}
          <div className="flex flex-col items-center text-center col-span-1">
            <div className="w-40 h-40 bg-white rounded-full shadow-xl flex items-center justify-center mb-8">
              <svg width="72" height="72" viewBox="0 0 48 48" fill="none" className="text-gray-800">
                <path d="M24 2L36 20H12L24 2Z" fill="currentColor" opacity="0.8" />
                <path d="M12 20L24 46L36 20H12Z" fill="currentColor" opacity="0.6" />
                <path d="M12 20L24 28L36 20L24 24L12 20Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-4xl font-semibold text-black mb-4">Stake</h2>
            <p className="text-xl text-gray-700 font-light max-w-xs">Deposit ETH into OmniLST smart contract</p>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex justify-center col-span-1">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="w-12 h-12 text-gray-400" />
            </motion.div>
          </div>
          <div className="lg:hidden flex justify-center my-4">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowDown className="w-12 h-12 text-gray-400" />
            </motion.div>
          </div>

          {/* Mint oLST */}
          <div className="flex flex-col items-center text-center col-span-1">
            <div className="w-40 h-40 bg-white rounded-full shadow-xl flex items-center justify-center mb-8">
              <svg width="72" height="72" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="olstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <path d="M24 2L36 20H12L24 2Z" fill="url(#olstGradient)" opacity="0.9" />
                <path d="M12 20L24 46L36 20H12Z" fill="url(#olstGradient)" opacity="0.7" />
                <path d="M12 20L24 28L36 20L24 24L12 20Z" fill="url(#olstGradient)" />
              </svg>
            </div>
            <h2 className="text-4xl font-semibold text-black mb-4">Mint</h2>
            <p className="text-xl text-gray-700 font-light max-w-xs">Get oLST, a cross-chain LST-backed synthetic</p>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex justify-center col-span-1">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="w-12 h-12 text-gray-400" />
            </motion.div>
          </div>
          <div className="lg:hidden flex justify-center my-4">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowDown className="w-12 h-12 text-gray-400" />
            </motion.div>
          </div>

          {/* Use in DeFi */}
          <div className="flex flex-col items-center text-center col-span-1">
            <div className="w-40 h-40 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 relative">
              {/* Protocol icons */}
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>

              <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" fill="#E5E7EB" />
                <circle cx="16" cy="16" r="8" fill="#9CA3AF" />
                <circle cx="16" cy="16" r="4" fill="#374151" />
              </svg>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-4xl font-semibold text-black">Use</h2>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
                <span className="text-sm">Explore</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xl text-gray-700 font-light max-w-xs">Deploy oLST in DeFi protocols and earn extra yield</p>
          </div>
        </div>
      </div>
    </div>
  );
};
