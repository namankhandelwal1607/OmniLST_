import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import { Header } from "./components/Header";
import Stake from "./pages/Stake";
import HomePage from "./pages/HomePage";
import abiDepositManager from "./ABIs/DepositManager.json";
import Withdraw from "./pages/Withdraw";
function App() {
  const [state, setState] = useState({
    provider: null, // static provider map for read-only
    signer: null,   // signer for txs
    contractDepositManagerEthereum: null,
    contractDepositManagerArbitrum: null,
    contractDepositManagerBase: null,
  });

  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const setupContracts = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) return alert("Please install MetaMask");

        if (!isConnecting) {
          setIsConnecting(true);

          // ✅ Connected user signer
          const web3Provider = new ethers.providers.Web3Provider(ethereum);
          const signer = web3Provider.getSigner();
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });

          // ✅ Alchemy static JSON-RPC providers for each chain
          const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
          const staticProviders = {
            ethereum: new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
          };

          // ✅ Contract instances using the signer for txs
          const contractDepositManagerEthereum = new ethers.Contract(
            import.meta.env.VITE_DepositManagerEthereum,
            abiDepositManager.abi,
            signer
          );
          const contractDepositManagerArbitrum = new ethers.Contract(
            import.meta.env.VITE_DepositManagerArbitrum,
            abiDepositManager.abi,
            signer
          );
          const contractDepositManagerBase = new ethers.Contract(
            import.meta.env.VITE_DepositManagerBase,
            abiDepositManager.abi,
            signer
          );

          // ✅ Store everything in global state
          setState({
            provider: staticProviders,
            signer,
            contractDepositManagerEthereum,
            contractDepositManagerArbitrum,
            contractDepositManagerBase,
          });

          setAccount(accounts[0]);

          // reload on wallet changes
          ethereum.on("chainChanged", () => window.location.reload());
          ethereum.on("accountsChanged", () => window.location.reload());
        }
      } catch (error) {
        if (error.code === -32002) {
          console.log("MetaMask is already processing a request.");
        } else {
          console.error("Error setting up contracts:", error);
        }
      } finally {
        setIsConnecting(false);
      }
    };

    setupContracts();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage state={state} />} />
          <Route path="/stake" element={<Stake state={state} />} />
          <Route path="/withdraw" element={<Withdraw state={state} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
