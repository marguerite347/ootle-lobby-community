// Adapted from ICS INC. MIT-licensed save-point example. See source/ and LICENSE.
const { gsap } = window;
import * as THREE from "three";
const imageCenter = new URL("./img/magic-circle-center.svg", import.meta.url).href;
const imageMiddle = new URL("./img/magic-circle-middle.svg", import.meta.url).href;
const imageOuter = new URL("./img/magic-circle-outer.svg", import.meta.url).href;
class MagicCircle extends THREE.Object3D {
  /** 初回モーションで個別に展開するレイヤーです。 */
  _layers = [];
  /** 各レイヤーの明るさを更新するマテリアルです。 */
  _materials = [];
  /** 各レイヤーの回転アニメーションです。 */
  _rotations = [];
  constructor() {
    super();
    const geometry = new THREE.PlaneGeometry(6, 6);
    const loader = new THREE.TextureLoader();
    const layers = [
      { image: imageOuter, color: 8469493, duration: 20, scale: 1, turn: 1 },
      { image: imageMiddle, color: 13219583, duration: 12, scale: 0.7, turn: -1 },
      { image: imageCenter, color: 13232896, duration: 8, scale: 1, turn: 1 }
    ];
    for (const { image, color, duration, scale, turn } of layers) {
      const texture = loader.load(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({
        color,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.y = 0.1;
      plane.rotation.x = -Math.PI / 2;
      plane.scale.setScalar(scale);
      plane.renderOrder = 1;
      const layer = new THREE.Object3D();
      layer.scale.setScalar(0);
      layer.add(plane);
      this.add(layer);
      this._layers.push(layer);
      this._materials.push(material);
      this._rotations.push(
        gsap.to(layer.rotation, {
          y: turn * Math.PI * 2,
          duration,
          ease: "none",
          repeat: -1
        })
      );
    }
  }
  /** 中心から外周へ、各レイヤーを少しずつずらして展開します。 */
  startEntrance() {
    const scales = [...this._layers].reverse().map((layer) => layer.scale);
    gsap.to(scales, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.65,
      stagger: 0.35,
      ease: "back.out(1.4)"
    });
  }
  /** 魔法陣の回転速度と明るさを更新します。 */
  update(energy, paused = false) {
    for (const rotation of this._rotations) rotation.timeScale(paused ? 0 : 1 + energy * 2);
    for (const material of this._materials) material.opacity = 0.3 + energy * 0.6;
  }
}
export {
  MagicCircle as default
};
