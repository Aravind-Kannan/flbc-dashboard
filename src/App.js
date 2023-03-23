import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import modelABI from "./ModelABI.json";
import hashStorageLocalABI from "./HashStorageLocalABI.json";
import hashStorageGlobalABI from "./HashStorageGlobalABI.json";

const DECIMAL_PART = 100_000;
const URL = "http://localhost:7545";
const contracts = {
  model: {
    contractAddress: "0x3CFdd17873bD4765f4b6328deE06F692aB32E0e0",
    ABI: modelABI,
  },
  hashStorageLocal: {
    contractAddress: "0x499d3cA782E12E530a1cE0A55E14181dBbd45F07",
    ABI: hashStorageLocalABI,
  },
  hashStorageGlobal: {
    contractAddress: "0xaccFC90d28D3D3c3271b20675561CeDC6040F9D8",
    ABI: hashStorageGlobalABI,
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
      const hashStorageLocalContract = new ethers.Contract(
        contracts.hashStorageLocal.contractAddress,
        contracts.hashStorageLocal.ABI,
        provider
      );
      const hashStorageGlobalContract = new ethers.Contract(
        contracts.hashStorageGlobal.contractAddress,
        contracts.hashStorageGlobal.ABI,
        provider
      );

      const _loss = await modelContract.getLoss();
      const _accuracy = await modelContract.getAccuracy();
      const _application = await modelContract.getApplication();
      console.log(_loss, _accuracy, _application);
      setLoss((Number(_loss) / DECIMAL_PART) * 100);
      setAccuracy((Number(_accuracy) / DECIMAL_PART) * 100);

      const modelLogs = await modelContract.queryFilter(
        "ValuesUpdated",
        0,
        "latest"
      );

      const hashStorageLocalLogs = await hashStorageLocalContract.queryFilter(
        "HashUpdated",
        0,
        "latest"
      );
      const hashStorageGlobalLogs = await hashStorageGlobalContract.queryFilter(
        "HashUpdated",
        0,
        "latest"
      );

      modelLogs.forEach((log, i) => {
        const parsedLog = modelContract.interface.parseLog(log);
        console.log("modelLogs", i);
        console.log(
          "Timestamp:",
          new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        );
        console.log("Accuracy:", Number(parsedLog.args[1]).toString());
        console.log("Loss:", Number(parsedLog.args[2]).toString());
        console.log("Application:", parsedLog.args[3]);
      });

      hashStorageLocalLogs.forEach((log, i) => {
        const parsedLog = hashStorageLocalContract.interface.parseLog(log);
        console.log("hashStorageLocalLogs", i);
        console.log(
          "Timestamp:",
          new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        );
        console.log("Hash:", parsedLog.args[1]);
        console.log("Application:", parsedLog.args[2]);
      });

      hashStorageGlobalLogs.forEach((log, i) => {
        const parsedLog = hashStorageGlobalContract.interface.parseLog(log);
        console.log("hashStorageGlobalLogs", i);
        console.log(
          "Timestamp:",
          new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        );
        console.log("Hash:", parsedLog.args[1]);
        console.log("Application:", parsedLog.args[2]);
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
