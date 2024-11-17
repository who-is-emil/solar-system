import * as THREE from 'three';

export default class Scene {
  constructor() {
    this.init();
  }

  init() {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const device = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    };

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 75;
    const aspect = device.width / device.height;
    const near = 0.1;
    const far = 5;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 2;

    this.scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;

    this.geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    this.material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.initLight();

    this.scene.add(this.mesh);

    requestAnimationFrame(this.render.bind(this));
  }

  initLight() {
    const color = 0xffffff;
    const intensity = 3;

    this.light = new THREE.DirectionalLight(color, intensity);
    this.light.position.set(-1, 2, 4);

    this.scene.add(this.light);
  }

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      this.renderer.setSize(width, height, false);

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  render(time) {
    time *= 0.001;

    this.resizeRendererToDisplaySize();

    this.mesh.rotation.x = time;
    this.mesh.rotation.y = time;

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
  }
}
