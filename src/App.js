import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import modelABI from "./ModelABI.json";
import hashStorageLocalABI from "./HashStorageLocalABI.json";
import hashStorageGlobalABI from "./HashStorageGlobalABI.json";
import Logs from "./Logs";

function titleCase(str) {
  return str
    .split("_")
    .map((s) => s[0].toUpperCase() + s.substring(1))
    .join(" ");
}

const DECIMAL_PART = 100_000;
const URL = "http://localhost:7545";
const contracts = {
  model: {
    contractAddress: "0x95F1929302B7C37660103Cc9f53aBeEAE71F3fB3",
    ABI: modelABI,
  },
  hashStorageLocal: {
    contractAddress: "0x95F1929302B7C37660103Cc9f53aBeEAE71F3fB3",
    ABI: hashStorageLocalABI,
  },
  hashStorageGlobal: {
    contractAddress: "0x6a9364078801ECFFcEc552C4F01F05F1902F30ac",
    ABI: hashStorageGlobalABI,
  },
};

function App() {
  const [modelEvents, setModelEvents] = useState([]);
  const [hashStorageLocalEvents, setHashStorageLocalEvents] = useState([]);
  const [hashStorageGlobalEvents, setHashStorageGlobalEvents] = useState([]);
  const [apps, setApps] = useState(new Set());
  const [selectedApp, setSelectedApp] = useState("all");

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

      setApps((prevState) => prevState.add("all"));
      setModelEvents([]);
      modelLogs.forEach((log, i) => {
        const parsedLog = modelContract.interface.parseLog(log);
        setApps((prevState) => prevState.add(parsedLog.args[3]));
        setModelEvents((prevState) => [
          ...prevState,
          {
            timestamp: new Date(
              Number(parsedLog.args[0]) * 1000
            ).toLocaleString(),
            accuracy:
              "Accuracy: " +
              (
                Math.round(
                  (Number(parsedLog.args[1]) / DECIMAL_PART) * 100 * 100
                ) / 100
              ).toString() +
              "%",
            loss:
              "Loss: " +
              (
                Math.round(
                  (Number(parsedLog.args[2]) / DECIMAL_PART) * 100 * 100
                ) / 100
              ).toString() +
              "%",
            application: parsedLog.args[3],
          },
        ]);
        console.log("modelLogs", parsedLog);
        // console.log(
        //   "Timestamp:",
        //   new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        // );
        console.log("Accuracy:", Number(parsedLog.args[1]).toString());
        console.log("Loss:", Number(parsedLog.args[2]).toString());
        // console.log("Application:", parsedLog.args[3]);
      });

      setHashStorageLocalEvents([]);
      hashStorageLocalLogs.forEach((log, i) => {
        const parsedLog = hashStorageLocalContract.interface.parseLog(log);
        setHashStorageLocalEvents((prevState) => [
          ...prevState,
          {
            timestamp: new Date(
              Number(parsedLog.args[0]) * 1000
            ).toLocaleString(),
            hash: parsedLog.args[1],
            application: parsedLog.args[2],
          },
        ]);
        // console.log("hashStorageLocalLogs", i);
        // console.log(
        //   "Timestamp:",
        //   new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        // );
        // console.log("Hash:", parsedLog.args[1]);
        // console.log("Application:", parsedLog.args[2]);
      });

      setHashStorageGlobalEvents([]);
      hashStorageGlobalLogs.forEach((log, i) => {
        const parsedLog = hashStorageGlobalContract.interface.parseLog(log);
        setHashStorageGlobalEvents((prevState) => [
          ...prevState,
          {
            timestamp: new Date(
              Number(parsedLog.args[0]) * 1000
            ).toLocaleString(),
            hash: parsedLog.args[1],
            application: parsedLog.args[2],
          },
        ]);
        // console.log("hashStorageGlobalLogs", i);
        // console.log(
        //   "Timestamp:",
        //   new Date(Number(parsedLog.args[0]) * 1000).toLocaleString()
        // );
        // console.log("Hash:", parsedLog.args[1]);
        // console.log("Application:", parsedLog.args[2]);
      });
      return () => clearInterval(interval);
    }, 1000);
  }, []);

  const handleClick = (event) => {
    setSelectedApp(Array.from(apps).sort()[Number(event.currentTarget.id)]);
  };

  return (
    <div className="flex items-center justify-center bg-gray-500 min-h-screen">
      <div className="m-8 p-2 bg-black shadow-2xl rounded-lg">
        <div className="p-2 grid place-items-center">
          <div className="border-red border-2 rounded-lg text-white flex gap-2 p-2">
            {Array.from(apps)
              .sort()
              .map((app, index) => {
                return (
                  <div
                    id={index}
                    key={index}
                    className={
                      app === selectedApp
                        ? "bg-yellow-800 hover:bg-yellow-500 rounded-md p-2"
                        : "hover:bg-yellow-500 rounded-md p-2"
                    }
                    onClick={handleClick}
                  >
                    {titleCase(app)}
                  </div>
                );
              })}
          </div>
        </div>
        <Logs
          data={modelEvents}
          title={"Model Metrics"}
          selectedApp={selectedApp}
        />
        <Logs
          data={hashStorageLocalEvents}
          title={"Hash Storage Local"}
          selectedApp={selectedApp}
        />
        <Logs
          data={hashStorageGlobalEvents}
          title={"Hash Storage Global"}
          selectedApp={selectedApp}
        />
      </div>
    </div>
  );
}

export default App;
