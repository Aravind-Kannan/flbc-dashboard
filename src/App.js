import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import modelABI from "./ModelABI.json";
import hashStorageABI from "./HashStorageABI.json";

const DECIMAL_PART = 100_000;
const URL = "http://localhost:7545";
const contracts = {
  model: {
    contractAddress: "0x1af24D3847D4EF774Ce27B6da860AacF3d043c42",
    ABI: modelABI,
  },
  hashStorage: {
    contractAddress: "0x8124ad03A38F20abC51279aBCdF9cb4f6589EF97",
    ABI: hashStorageABI,
  },
};

function App() {
  const [loss, setLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const provider = new ethers.JsonRpcProvider(URL);
      const modelContract = new ethers.Contract(
        contracts.model.contractAddress,
        contracts.model.ABI,
        provider
      );
      const hashStorageContract = new ethers.Contract(
        contracts.hashStorage.contractAddress,
        contracts.hashStorage.ABI,
        provider
      );

      const _loss = await modelContract.getLoss();
      const _accuracy = await modelContract.getAccuracy();
      const _application = await modelContract.getApplication();
      console.log(_loss, _accuracy, _application);
      setLoss((Number(_loss) / DECIMAL_PART) * 100);
      setAccuracy((Number(_accuracy) / DECIMAL_PART) * 100);

      const _hash = await hashStorageContract.getHash();
      console.log(_hash);
      const modelLogs = await modelContract.queryFilter(
        "ValuesUpdated",
        0,
        "latest"
      );

      const hashStorageLogs = await hashStorageContract.queryFilter(
        "HashUpdated",
        0,
        "latest"
      );

      modelLogs.forEach((log, i) => {
        const parsedLog = modelContract.interface.parseLog(log);
        console.log(i);
        console.log(
          "Timestamp:",
          new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        );
        console.log("Accuracy:", Number(parsedLog.args[1]).toString());
        console.log("Loss:", Number(parsedLog.args[2]).toString());
        console.log("Application:", parsedLog.args[3]);
      });

      hashStorageLogs.forEach((log, i) => {
        const parsedLog = hashStorageContract.interface.parseLog(log);
        console.log(i);
        console.log(
          "Timestamp:",
          new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        );
        console.log("Hash:", parsedLog.args[1]);
      });
      return () => clearInterval(interval);
    }, 1000);
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
