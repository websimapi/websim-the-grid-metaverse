import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import * as ReactDOM from "react-dom/client";
import SceneManager from "./SceneManager.jsx";
const room = new WebsimSocket();
const REGION_SIZE = 256;
function usePresence() {
  const presence = React.useSyncExternalStore(
    (callback) => room.subscribePresence(callback),
    () => room.presence
  );
  return presence;
}
async function ensureInitialRegions() {
  await room.initialize();
  return new Promise((resolve, reject) => {
    const regionCollection = room.collection("region_v1").filter({ x: 0, y: 0 });
    let resolved = false;
    const unsubscribe = regionCollection.subscribe(async (regions) => {
      if (resolved) return;
      if (regions) {
        if (regions.length === 0) {
          console.log("Creating initial region (0, 0)...");
          try {
            await room.collection("region_v1").create({
              x: 0,
              y: 0,
              name: "Welcome Sim",
              ground_color: 4500036
            });
            console.log("Initial region created.");
          } catch (e) {
            console.error("Failed to create initial region", e);
            if (!resolved) {
              resolved = true;
              unsubscribe();
              reject(e);
            }
          }
        } else {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        }
      }
    });
  });
}
function useFilteredRecords(collectionName, filter = {}) {
  const filterObject = JSON.stringify(filter);
  const collectionFilter = React.useMemo(() => {
    return room.collection(collectionName).filter(filter);
  }, [collectionName, filterObject]);
  const list = React.useSyncExternalStore(
    (callback) => collectionFilter.subscribe(callback),
    () => collectionFilter.getList()
  );
  return list;
}
function GridWorld() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const peerPresence = usePresence();
  const currentClientId = room.clientId;
  const initialPos = {
    x: REGION_SIZE / 2,
    y: REGION_SIZE / 2,
    // Y (depth)
    z: 1,
    // Z (height)
    region_x: 0,
    region_y: 0
  };
  React.useEffect(() => {
    async function setup() {
      await ensureInitialRegions();
      setIsInitialized(true);
      const initialPresence = room.presence[currentClientId];
      if (!initialPresence || initialPresence.x === void 0) {
        room.updatePresence(initialPos);
      }
    }
    setup();
    room.subscribePresenceUpdateRequests((updateRequest, fromClientId) => {
      console.log(`Received presence update request from ${fromClientId}:`, updateRequest);
    });
  }, [currentClientId]);
  const myPresence = peerPresence[currentClientId] || initialPos;
  const region_x = myPresence.region_x ?? initialPos.region_x;
  const region_y = myPresence.region_y ?? initialPos.region_y;
  const regions = useFilteredRecords("region_v1", { x: region_x, y: region_y });
  const currentRegion = regions[0];
  const primitives = useFilteredRecords("prim_v1", { region_x, region_y });
  const handleMovement = (newPos) => {
    let { x, y, z } = newPos;
    let rx = region_x;
    let ry = region_y;
    let boundaryCrossed = false;
    if (x >= REGION_SIZE) {
      rx += 1;
      x -= REGION_SIZE;
      boundaryCrossed = true;
    } else if (x < 0) {
      rx -= 1;
      x += REGION_SIZE;
      boundaryCrossed = true;
    }
    if (y >= REGION_SIZE) {
      ry += 1;
      y -= REGION_SIZE;
      boundaryCrossed = true;
    } else if (y < 0) {
      ry -= 1;
      y += REGION_SIZE;
      boundaryCrossed = true;
    }
    if (boundaryCrossed) {
      console.log(`Transferring presence: (${region_x}, ${region_y}) -> (${rx}, ${ry})`);
    }
    room.updatePresence({
      x,
      y,
      z,
      region_x: rx,
      region_y: ry
    });
  };
  const otherPeers = Object.entries(peerPresence).filter(([id]) => id !== currentClientId && id in room.peers).map(([id, data]) => ({ id, ...data }));
  if (!isInitialized || !currentRegion) {
    return /* @__PURE__ */ jsxDEV("div", { className: "hud", children: [
      "Connecting to the Grid... Waiting for Region Data (",
      region_x,
      ", ",
      region_y,
      ")..."
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 189,
      columnNumber: 16
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "hud", children: [
      "Grid Location: ",
      region_x,
      ", ",
      region_y,
      " (",
      currentRegion.name,
      ")",
      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 195,
        columnNumber: 77
      }, this),
      "Local Position: X:",
      myPresence.x?.toFixed(1) || 0,
      " Y:",
      myPresence.y?.toFixed(1) || 0,
      " Z:",
      myPresence.z?.toFixed(1) || 0,
      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 196,
        columnNumber: 134
      }, this),
      "Peers Online: ",
      Object.keys(peerPresence).length
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 194,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      SceneManager,
      {
        room,
        region: currentRegion,
        primitives,
        myPosition: myPresence,
        otherPeers,
        onMovement: handleMovement,
        regionSize: REGION_SIZE
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 200,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(UGCPanel, { region_x, region_y }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 210,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 193,
    columnNumber: 9
  }, this);
}
function UGCPanel({ region_x, region_y }) {
  const handleCreatePrim = async (shape) => {
    const username = room.peers[room.clientId]?.username || "Unknown Builder";
    try {
      await room.collection("prim_v1").create({
        region_x,
        region_y,
        shape,
        position: {
          x: REGION_SIZE / 2 + (Math.random() - 0.5) * 5,
          y: REGION_SIZE / 2 + (Math.random() - 0.5) * 5,
          z: 5
          // spawn slightly above ground
        },
        scale: { x: 1, y: 1, z: 1 },
        color: Math.floor(Math.random() * 16777215),
        // Random color
        script: "// User created script goes here"
      });
      console.log(`${username} created new ${shape} prim.`);
    } catch (e) {
      console.error("Failed to create prim (permissions or connection error):", e);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "ugc-panel", children: [
    /* @__PURE__ */ jsxDEV("h2", { children: "Building Tools" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 242,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("p", { children: [
      "Active Sim: (",
      region_x,
      ", ",
      region_y,
      ")"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 243,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("button", { onClick: () => handleCreatePrim("box"), children: "Create Box" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 244,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("button", { onClick: () => handleCreatePrim("sphere"), children: "Create Sphere" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 245,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 241,
    columnNumber: 9
  }, this);
}
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(/* @__PURE__ */ jsxDEV(GridWorld, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 252,
  columnNumber: 13
}));
