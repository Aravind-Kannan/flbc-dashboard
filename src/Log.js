import React from "react";
import { FaRegCreditCard, FaClock } from "react-icons/fa";

function titleCase(str) {
  return str
    .split("_")
    .map((s) => s[0].toUpperCase() + s.substring(1))
    .join(" ");
}

export default function Log(props) {
  const displayKeys = Object.keys(props.data).filter(
    (key) => key !== "application" && key !== "timestamp"
  );

  return (
    <div className="p-2 grid grid-cols-2 bg-gray-300 rounded-md">
      <div className="grid grid-cols-1 place-content-center font-mono">
        {displayKeys.map((key, index) => {
          return <div key={index}>{props.data[key]}</div>;
        })}
      </div>
      <div className="grid grid-cols-2 place-items-center">
        <div
          className={
            props.color +
            " p-2 rounded-lg font-bold flex items-center gap-2 text-black"
          }
        >
          <FaRegCreditCard />
          <div>{titleCase(props.data["application"])}</div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white rounded-full font-semibold">
          <FaClock />
          <div>{props.data["timestamp"]}</div>
        </div>
      </div>
    </div>
  );
}
