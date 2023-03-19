import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import contractABI from "./ModelMetricStoreContractABI.json";

const DECIMAL_PART = 100_000;
const URL = "http://localhost:7545";
const CONTRACT_ADDRESS = "0x7558BE17824B3C943eC338D3138Dc958585783e7";

function App() {
  const [loss, setLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const provider = new ethers.JsonRpcProvider(URL);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const _loss = await contract.getLoss();
      const _accuracy = await contract.getAccuracy();
      console.log(_loss, _accuracy);
      setLoss((Number(_loss) / DECIMAL_PART) * 100);
      setAccuracy((Number(_accuracy) / DECIMAL_PART) * 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Loss: {loss} %</h1>
        <h1>Accuracy: {accuracy} %</h1>
      </header>
    </div>
  );
}

export default App;
