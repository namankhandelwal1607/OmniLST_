import React from 'react';
import { Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full px-8 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <Droplet className="w-8 h-8 text-black" />
        <span className="text-2xl font-bold text-black tracking-wide">oLST</span>
      </Link>


      <nav className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">
          Staking
        </a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">
          Integrations
        </a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">
          Node Operators
        </a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">
          Lido DAO
        </a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">
          Developers
        </a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">
          Learn
        </a>
      </nav>

      <button onClick={() => navigate('/stake')} className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
        Stake ETH
      </button>
    </header>
  );
};
