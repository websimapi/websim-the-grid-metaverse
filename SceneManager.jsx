import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import Avatar from "./Avatar.jsx";
import ObjectPrim from "./ObjectPrim.jsx";
const SceneManager = React.memo(({ region, primitives, myPosition, otherPeers, onMovement, regionSize }) => {
  const mountRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const cameraRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const controlsRef = React.useRef(null);
  const lastUpdateTimeRef = React.useRef(performance.now());
  const movementState = React.useRef({ forward: false, backward: false, left: false, right: false, up: false, down: false });
  const MOVE_SPEED = 5;
  const MAX_FLY_SPEED = 15;
  const DRAG_FACTOR = 0.9;
  const GRAVITY = -15;
  const JUMP_VELOCITY = 7;
  const FLY_THRUST = 1;
  const velocity = React.useRef(new THREE.Vector3(0, 0, 0));
  const isFlying = React.useRef(false);
  const isGrounded = React.useRef(true);
  const tempVector = new THREE.Vector3();
  const currentSimPosition = React.useRef(new THREE.Vector3(myPosition.x, myPosition.z, myPosition.y));
  React.useEffect(() => {
    if (!mountRef.current) return;
    if (rendererRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
      controlsRef.current.dispose();
    }
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(8900331);
    sceneRef.current = scene;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1e3);
    camera.position.set(currentSimPosition.current.x - 5, currentSimPosition.current.y + 3, currentSimPosition.current.z);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const ambientLight = new THREE.AmbientLight(4210752, 3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(16777215, 5);
    directionalLight.position.set(50, 200, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -regionSize * 0.5;
    directionalLight.shadow.camera.right = regionSize * 0.5;
    directionalLight.shadow.camera.top = regionSize * 0.5;
    directionalLight.shadow.camera.bottom = -regionSize * 0.5;
    scene.add(directionalLight);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controlsRef.current = controls;
    const planeGeometry = new THREE.PlaneGeometry(regionSize, regionSize);
    const groundColor = new THREE.Color(region.ground_color || 4500036);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: groundColor });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    plane.name = "RegionGround";
    scene.add(plane);
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
          movementState.current.forward = true;
          break;
        case "KeyS":
          movementState.current.backward = true;
          break;
        case "KeyA":
          movementState.current.left = true;
          break;
        case "KeyD":
          movementState.current.right = true;
          break;
        case "Space":
          if (!isFlying.current && isGrounded.current) {
            velocity.current.y = JUMP_VELOCITY;
            isGrounded.current = false;
          }
          movementState.current.up = true;
          break;
        case "KeyC":
        case "ShiftLeft":
          movementState.current.down = true;
          break;
        case "KeyF":
          isFlying.current = !isFlying.current;
          console.log(`Flying: ${isFlying.current ? "ON" : "OFF"}`);
          velocity.current.y = 0;
          isGrounded.current = false;
          break;
      }
    };
    const handleKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
          movementState.current.forward = false;
          break;
        case "KeyS":
          movementState.current.backward = false;
          break;
        case "KeyA":
          movementState.current.left = false;
          break;
        case "KeyD":
          movementState.current.right = false;
          break;
        case "Space":
          movementState.current.up = false;
          break;
        case "KeyC":
        case "ShiftLeft":
          movementState.current.down = false;
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [region, regionSize]);
  const animate = React.useCallback(() => {
    requestAnimationFrame(animate);
    const delta = (performance.now() - lastUpdateTimeRef.current) / 1e3;
    lastUpdateTimeRef.current = performance.now();
    if (!cameraRef.current || !controlsRef.current || !rendererRef.current) return;
    controlsRef.current.update();
    const inputVector = new THREE.Vector3(0, 0, 0);
    cameraRef.current.getWorldDirection(tempVector);
    tempVector.y = 0;
    tempVector.normalize();
    if (movementState.current.forward) {
      inputVector.add(tempVector);
    }
    if (movementState.current.backward) {
      inputVector.sub(tempVector);
    }
    tempVector.cross(cameraRef.current.up).normalize();
    if (movementState.current.right) {
      inputVector.add(tempVector);
    }
    if (movementState.current.left) {
      inputVector.sub(tempVector);
    }
    if (inputVector.lengthSq() > 0) {
      inputVector.normalize();
      velocity.current.x += inputVector.x * MOVE_SPEED;
      velocity.current.z += inputVector.z * MOVE_SPEED;
    }
    if (isFlying.current) {
      if (movementState.current.up) {
        velocity.current.y += FLY_THRUST;
      } else if (movementState.current.down) {
        velocity.current.y -= FLY_THRUST;
      }
      velocity.current.clampScalar(-MAX_FLY_SPEED, MAX_FLY_SPEED);
    } else {
      if (!isGrounded.current) {
        velocity.current.y += GRAVITY * delta;
      }
    }
    const drag = DRAG_FACTOR ** (delta * 60);
    velocity.current.x *= drag;
    velocity.current.z *= drag;
    if (isFlying.current) {
      velocity.current.y *= drag;
    } else if (isGrounded.current) {
      velocity.current.x *= 0.8;
      velocity.current.z *= 0.8;
    }
    const deltaMovement = velocity.current.clone().multiplyScalar(delta);
    currentSimPosition.current.add(deltaMovement);
    const minHeight = 1;
    if (currentSimPosition.current.y < minHeight) {
      currentSimPosition.current.y = minHeight;
      velocity.current.y = 0;
      isGrounded.current = true;
    } else {
      isGrounded.current = currentSimPosition.current.y <= minHeight + 0.05;
    }
    controlsRef.current.target.copy(currentSimPosition.current);
    const newPos = {
      x: currentSimPosition.current.x,
      y: currentSimPosition.current.z,
      z: currentSimPosition.current.y
    };
    const threshold = isFlying.current ? 0.05 : 0.01;
    const dx = newPos.x - myPosition.x;
    const dy = newPos.y - myPosition.y;
    const dz = newPos.z - myPosition.z;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold || Math.abs(dz) > threshold || velocity.current.lengthSq() > 0.01) {
      onMovement(newPos);
    }
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [onMovement, myPosition]);
  React.useEffect(() => {
    animate();
  }, [animate]);
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const existingPrimMeshes = scene.children.filter((c) => c.userData.type === "prim");
    const primIdMap = new Map(existingPrimMeshes.map((mesh) => [mesh.userData.recordId, mesh]));
    const newPrimIds = new Set(primitives.map((p) => p.id));
    existingPrimMeshes.forEach((mesh) => {
      if (!newPrimIds.has(mesh.userData.recordId)) {
        scene.remove(mesh);
      }
    });
    primitives.forEach((prim) => {
      let primMesh = primIdMap.get(prim.id);
      if (!primMesh) {
        primMesh = ObjectPrim.createMesh(prim);
        scene.add(primMesh);
      }
      ObjectPrim.updateMesh(primMesh, prim);
    });
  }, [primitives]);
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const existingAvatars = scene.children.filter((c) => c.userData.type === "avatar");
    const avatarIdMap = new Map(existingAvatars.map((mesh) => [mesh.userData.clientId, mesh]));
    const currentPeerIds = new Set(otherPeers.map((p) => p.id));
    existingAvatars.forEach((mesh) => {
      if (!currentPeerIds.has(mesh.userData.clientId)) {
        scene.remove(mesh);
      }
    });
    otherPeers.forEach((peer) => {
      let avatarMesh = avatarIdMap.get(peer.id);
      const peerInfo = room.peers[peer.id];
      if (peer.region_x !== myPosition.region_x || peer.region_y !== myPosition.region_y) {
        if (avatarMesh) scene.remove(avatarMesh);
        return;
      }
      if (!avatarMesh) {
        avatarMesh = Avatar.createMesh(peer, peerInfo);
        scene.add(avatarMesh);
      }
      avatarMesh.position.set(peer.x || 0, peer.z || 0, peer.y || 0);
    });
  }, [otherPeers, myPosition.region_x, myPosition.region_y]);
  return /* @__PURE__ */ jsxDEV("div", { ref: mountRef }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 362,
    columnNumber: 9
  });
});
var stdin_default = SceneManager;
export {
  stdin_default as default
};
