import React from "react";
import Log from "./Log";

const colors = ["bg-cyan-400", "bg-green-400"];

export default function Logs(props) {
  let application = new Set();
  props.data.forEach((data) => {
    application.add(data["application"]);
  });
  application = Array.from(application);

  let data = props.data;
  if (props.selectedApp !== "all") {
    data = props.data.filter((data) => {
      return data["application"] === props.selectedApp;
    });
  }

  return (
    <div>
      <h1 className="m-2 p-2 text-4xl font-semibold text-white">
        {props.title}
      </h1>
      <div className="grid gap-2 p-2 m-2">
        {data.map((data, index) => {
          return (
            <Log
              key={index}
              data={data}
              color={
                colors[
                  application.findIndex(
                    (element) => element === data["application"]
                  )
                ]
              }
            />
          );
        })}
      </div>
    </div>
  );
}
