import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
function LoginScreen({ onConnect, status, error }) {
  const [url, setUrl] = React.useState("ws://localhost:8080");
  const handleSubmit = (e) => {
    e.preventDefault();
    onConnect(url);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "login-screen", children: [
    /* @__PURE__ */ jsxDEV("h1", { children: "The Grid" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "connect-box", children: [
      /* @__PURE__ */ jsxDEV("h2", { children: "Connect to a Grid" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "text",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "Enter Grid WebSocket URL",
            disabled: status === "connecting"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 17,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("button", { type: "submit", disabled: status === "connecting", children: status === "connecting" ? "Connecting..." : "Connect" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 16,
        columnNumber: 17
      }, this),
      status === "error" && /* @__PURE__ */ jsxDEV("p", { className: "error-message", children: error }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 28,
        columnNumber: 40
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 14,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "server-info", children: [
      /* @__PURE__ */ jsxDEV("h3", { children: "Host Your Own Grid" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { children: "To explore the metaverse, you need to connect to a grid server. You can run your own local grid by following these steps:" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("ol", { children: [
        /* @__PURE__ */ jsxDEV("li", { children: "Make sure you have Node.js installed on your computer." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 35,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("li", { children: "Create a new folder named `server`." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 36,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("li", { children: "Inside the `server` folder, save the `package.json` and `server.js` files provided in the project source." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 37,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("li", { children: "Open a terminal or command prompt in the `server` folder." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 38,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("li", { children: [
          "Run the command: ",
          /* @__PURE__ */ jsxDEV("pre", { children: "npm install" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 39,
            columnNumber: 42
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 39,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("li", { children: [
          "Then run the command: ",
          /* @__PURE__ */ jsxDEV("pre", { children: "node server.js" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 40,
            columnNumber: 47
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 40,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("li", { children: "Your local grid server is now running! Connect to it using the default URL above." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 41,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 34,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { children: "You can view the server code in the `server/` directory of the generated files to see how it works." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 43,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 31,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 12,
    columnNumber: 9
  }, this);
}
var stdin_default = LoginScreen;
export {
  stdin_default as default
};
