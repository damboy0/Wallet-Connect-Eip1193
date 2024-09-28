import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false); 

  useEffect(() => {
    const setup = async () => {
      const provider = await detectEthereumProvider();
      if (provider && provider === window.ethereum) {
        console.log("MetaMask is available!");

        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainId);

        // Listen for chain/network changes
        window.ethereum.on("chainChanged", handleChainChanged);
      } else {
        console.log("Please install MetaMask!");
        setErrorMessage("MetaMask not installed. Please install it to interact with the dapp.");
      }
    };
    setup();

    // Clean up event listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Handle network chain change
  const handleChainChanged = (newChainId) => {
    if (newChainId !== chainId) {
      setChainId(newChainId);
      setErrorMessage("Chain has changed. Please refresh the page.");
    }
  };

  // Request account access
  const getAccount = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setIsConnected(true); // Mark as connected
    } catch (error) {
      if (error.code === 4001) { // 4001 - Error code for when user rejects conn. request
        console.log("User rejected the request.");
        setErrorMessage("Please connect to MetaMask.");
      } else {
        console.error(error);
        setErrorMessage("An error occurred while connecting to MetaMask.");
      }
    }
  };

  
  const disconnectAccount = () => {
    setAccount(null);
    setIsConnected(false); // Mark as disconnected
    setErrorMessage(""); // Clear any previous error message
  };

  return (
    <div className="App">
      {!isConnected ? (
        <button onClick={getAccount} className="enableEthereumButton">Enable Ethereum</button>
      ) : (
        <>
          <h2>Account: <span className="showAccount">{account || errorMessage}</span></h2>
          {chainId && <h3>Chain ID: <span className="showChainId">{chainId}</span></h3>}
          <button onClick={disconnectAccount} className="disconnectButton">Disconnect</button>
        </>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default App;
