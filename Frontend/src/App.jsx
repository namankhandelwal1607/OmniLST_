import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import { Header } from "./components/Header";
import Stake from "./pages/Stake";
import HomePage from "./pages/HomePage";
import abiDepositManager from "./ABIs/DepositManager.json";

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
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

        if (ethereum && !isConnecting) {
          setIsConnecting(true);

          const provider = new ethers.providers.Web3Provider(ethereum);
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });
          const signer = provider.getSigner();

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

          setState({
            provider,
            signer,
            contractDepositManagerEthereum,
            contractDepositManagerArbitrum,
            contractDepositManagerBase,
          });

          setAccount(accounts[0]);

          ethereum.on("chainChanged", () => window.location.reload());
          ethereum.on("accountsChanged", () => window.location.reload());
        } else {
          alert("Please install MetaMask");
        }
      } catch (error) {
        if (error.code === -32002) {
          console.log("MetaMask is already processing a request. Please wait.");
        } else {
          console.error("Contract connection failed:", error);
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
          <Route path="/" element={<HomePage />} />
          <Route path="/stake" element={<Stake state={state} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
