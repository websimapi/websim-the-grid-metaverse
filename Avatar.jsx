import * as THREE from "three";
const Avatar = {
  createMesh: (peerData, peerInfo) => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const material = new THREE.MeshPhongMaterial({ color: 65535 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = "avatar";
    mesh.userData.clientId = peerData.id;
    mesh.castShadow = true;
    const username = peerInfo?.username || `Guest`;
    const spriteCanvas = document.createElement("canvas");
    const context = spriteCanvas.getContext("2d");
    const padding = 10;
    const font = "Bold 40px Arial";
    context.font = font;
    const textWidth = context.measureText(username).width;
    const width = textWidth + padding * 2;
    const height = 50;
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    context.font = font;
    context.textAlign = "center";
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "white";
    context.fillText(username, width / 2, 40);
    const texture = new THREE.CanvasTexture(spriteCanvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(width / 20, height / 20, 1);
    sprite.position.set(0, 1.5, 0);
    mesh.add(sprite);
    mesh.position.set(peerData.x || 0, peerData.z || 0, peerData.y || 0);
    return mesh;
  }
};
var stdin_default = Avatar;
export {
  stdin_default as default
};
