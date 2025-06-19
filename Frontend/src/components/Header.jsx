import React, { useState, useEffect } from 'react';
import { Droplet } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [account, setAccount] = useState(null);
  const [isStakeMode, setIsStakeMode] = useState(location.pathname === '/stake');

  // Update mode when route changes
  useEffect(() => {
    setIsStakeMode(location.pathname === '/stake');
  }, [location.pathname]);

  const connectOrDisconnectWallet = async () => {
    if (account) {
      setAccount(null); // Disconnect
    } else {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } catch (err) {
          console.error('User rejected wallet connection:', err);
        }
      } else {
        alert('MetaMask not detected. Please install MetaMask.');
      }
    }
  };

  const handleToggle = () => {
    const nextPath = isStakeMode ? '/withdraw' : '/stake';
    navigate(nextPath);
  };

  return (
    <header className="w-full px-8 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <Droplet className="w-8 h-8 text-black" />
        <span className="text-2xl font-bold text-black tracking-wide">oLST</span>
      </Link>

      <nav className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">Staking</a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">Integrations</a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">Node Operators</a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">Lido DAO</a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">Developers</a>
        <a href="#" className="text-gray-700 hover:text-black transition-colors font-medium">Learn</a>
      </nav>

      {location.pathname === '/stake' || location.pathname === '/withdraw' ? (
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggle}
            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            {isStakeMode ? 'Withdraw ETH' : 'Stake ETH'}
          </button>
          <button
            onClick={connectOrDisconnectWallet}
            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate('/stake')}
          className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          Stake ETH
        </button>
      )}
    </header>
  );
};
