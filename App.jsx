import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import GridWorld from "./GridWorld.jsx";
import LoginScreen from "./LoginScreen.jsx";
import WebsimSocketClient from "./WebsimSocketClient.js";
function App() {
  const [room, setRoom] = React.useState(null);
  const [connectionStatus, setConnectionStatus] = React.useState("disconnected");
  const [errorMessage, setErrorMessage] = React.useState("");
  const handleConnect = (url) => {
    setConnectionStatus("connecting");
    const newRoom = new WebsimSocketClient();
    newRoom.connect(url).then(() => {
      setConnectionStatus("connected");
      setRoom(newRoom);
    }).catch((err) => {
      setConnectionStatus("error");
      setErrorMessage(err.message || "Failed to connect. Is the server running?");
      console.error(err);
    });
  };
  if (connectionStatus === "connected" && room) {
    return /* @__PURE__ */ jsxDEV(GridWorld, { room }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 29,
      columnNumber: 16
    }, this);
  } else {
    return /* @__PURE__ */ jsxDEV(
      LoginScreen,
      {
        onConnect: handleConnect,
        status: connectionStatus,
        error: errorMessage
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 13
      },
      this
    );
  }
}
const container = document.getElementById("root");
const root = createRoot(container);
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 43,
  columnNumber: 13
}));
