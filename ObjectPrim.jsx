import * as THREE from "three";
const Geometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(0.5, 32, 32),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
};
const ObjectPrim = {
  createMesh: (primRecord) => {
    const shapeKey = primRecord.shape && Geometries[primRecord.shape] ? primRecord.shape : "box";
    const geometry = Geometries[shapeKey];
    const color = primRecord.color || 13421772;
    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = "prim";
    mesh.userData.recordId = primRecord.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ObjectPrim.updateMesh(mesh, primRecord);
    return mesh;
  },
  updateMesh: (mesh, primRecord) => {
    const pos = primRecord.position;
    if (pos) {
      mesh.position.set(pos.x || 0, pos.z || 0, pos.y || 0);
    }
    const scale = primRecord.scale;
    if (scale) {
      mesh.scale.set(scale.x || 1, scale.z || 1, scale.y || 1);
    }
    const rot = primRecord.rotation;
    if (rot) {
      mesh.rotation.set(rot.x || 0, rot.z || 0, rot.y || 0);
    }
    if (primRecord.color !== void 0 && mesh.material) {
      if (mesh.material.color.getHex() !== primRecord.color) {
        mesh.material.color.setHex(primRecord.color);
      }
    }
  }
};
var stdin_default = ObjectPrim;
export {
  stdin_default as default
};
