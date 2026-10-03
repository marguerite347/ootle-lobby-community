// Adapted from ICS INC. MIT-licensed save-point example. See source/ and LICENSE.
import * as THREE from "three";
const imageSwirl = new URL("./img/swirl.png", import.meta.url).href;
class Swirl extends THREE.Object3D {
  /** 明るさを更新するマテリアルです。 */
  _material;
  /** 光の流れを動かすテクスチャーです。 */
  _texture;
  constructor() {
    super();
    this._texture = new THREE.TextureLoader().load(imageSwirl);
    this._texture.offset.y = -0.25;
    this._texture.wrapS = THREE.RepeatWrapping;
    this._texture.colorSpace = THREE.SRGBColorSpace;
    this._material = new THREE.MeshBasicMaterial({
      color: 33023,
      map: this._texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.1
    });
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(4, 1, 2, 100), this._material);
    mesh.position.y = 0.02;
    mesh.rotation.x = Math.PI / 2;
    this.add(mesh);
  }
  /** 回転・光の流れ・明るさを更新します。 */
  update(delta, energy) {
    const speed = 0.1 + energy * 0.4;
    this.rotation.y -= delta * speed;
    this._texture.offset.x -= delta * speed;
    this._material.color.setRGB(0.5 + energy * 0.2, 0.15 + energy * 0.3, 1).multiplyScalar(1 + energy * 0.8);
    this._material.opacity = 0.35 + energy * 0.2;
  }
}
export {
  Swirl as default
};
