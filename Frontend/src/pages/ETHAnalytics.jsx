import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const colors = ['#34a0a4', '#52796f', '#ffb703'];

const ETHAnalytics = ({ providerMap }) => {
  const [ethData, setEthData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const provider = providerMap?.ethereum;
      if (!provider) {
        console.warn("Ethereum Sepolia provider not available");
        return;
      }

      const contractMap = {
        stETH: import.meta.env.VITE_MockLido,
        rETH: import.meta.env.VITE_MockRocketPool,
        lsETH: import.meta.env.VITE_MockStader,
      };

      let rawData = [];

      for (const [name, address] of Object.entries(contractMap)) {
        if (!address) continue;
        try {
          const balance = await provider.getBalance(address);
          const eth = parseFloat(ethers.utils.formatEther(balance));
          rawData.push({ name, eth });
        } catch (err) {
          console.error(`❌ Failed to fetch balance for ${name}:`, err);
        }
      }

      const total = rawData.reduce((sum, item) => sum + item.eth, 0);
      const formattedData = rawData.map(item => ({
        ...item,
        percent: total > 0 ? Number(((item.eth / total) * 100).toFixed(2)) : 0,
      }));

      setEthData(formattedData);
    };

    fetchData();
  }, [providerMap]);

  if (!providerMap?.ethereum) {
    return (
      <div className="text-center text-gray-400 w-full pt-12">
        Loading ETH Analytics...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold mb-8 text-center">
        ETH Distribution Across oLST Contracts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Percentage Distribution (Pie)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ethData}
                dataKey="percent"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${percent}%`}
              >
                {ethData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">ETH Amount (Bar)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ethData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'ETH', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value} ETH`} />
              <Legend />
              <Bar dataKey="eth" fill="#34a0a4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ETHAnalytics;
