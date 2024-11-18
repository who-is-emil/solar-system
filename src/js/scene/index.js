import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

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

    this.time = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 75;
    const aspect = device.width / device.height;
    const near = 0.1;
    const far = 3000;

    this.objects = {};
    this.orbits = {};
    this.axes = {};

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 700, 0);

    const controls = new OrbitControls(this.camera, canvas);
    controls.update();

    this.scene = new THREE.Scene();

    this.initSolarSystem();

    this.addStars();
    this.addLight();

    requestAnimationFrame(this.render.bind(this));
  }

  addLight() {
    const color = 0xffffff; // Белый цвет света
    const intensity = 40000; // Интенсивность света
    const distance = 5000; // Радиус освещения
    const decay = 2; // Затухание

    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(0, 0, 0); // Центр солнечной системы

    this.scene.add(light);
  }

  createSphere(r, ws, hs, color, sun = false) {
    const geometry = new THREE.SphereGeometry(r, ws, hs);
    let mesh;
    if (sun) {
      this.sunMaterial = new THREE.ShaderMaterial({
        // side: THREE.DoubleSide,
        // wireframe: true,
        fragmentShader: fragment,
        vertexShader: vertex,
        uniforms: {
          time: { type: 'f', value: 0 },
        },
      });

      mesh = new THREE.Mesh(geometry, this.sunMaterial);
    } else {
      const material = new THREE.MeshPhongMaterial({ color });
      mesh = new THREE.Mesh(geometry, material);
    }

    return mesh;
  }

  initSolarSystem() {
    this.solarSystem = new THREE.Object3D();
    this.scene.add(this.solarSystem);

    // Солнце
    this.initPlanet('sun', 50, 0xffff00, 0, 0, 0.001, true);

    // Меркурий
    this.initPlanet('mercury', 1, 0x9f2a2a, 100, 0.01, 0.05);

    // Венера
    this.initPlanet('venus', 3, 0xa57a39, 150, 0.008, 0.04);

    // Земля
    this.initPlanet('earth', 3, 0x00b0ff, 200, 0.006, 0.03);

    // Марс
    this.initPlanet('mars', 2.5, 0x943535, 250, 0.005, 0.02);

    // Юпитер
    this.initPlanet('jupiter', 10, 0x612a00, 300, 0.004, 0.01);

    // Сатурн
    this.initPlanet('saturn', 8, 0x614500, 350, 0.003, 0.008);

    // Уран
    this.initPlanet('uranus', 6, 0xbad5e3, 400, 0.002, 0.007);

    // Нептун
    this.initPlanet('neptune', 6, 0x41809f, 450, 0.001, 0.005);
  }

  initPlanet(name, radius, color, distance, orbitSpeed, rotationSpeed, sun = false) {
    // объект орбиты
    this.orbits[name] = new THREE.Object3D();

    // ось вращения
    this.axes[name] = new THREE.Object3D();

    // планета (сфера)
    this.objects[name] = this.createSphere(radius, 32, 32, color, sun);

    // добавление планеты в ось вращения
    this.axes[name].add(this.objects[name]);

    // установка позиции орбиты на указанное расстояние от центра
    this.axes[name].position.set(distance, 0, 0);

    // добавление оси вращения в орбиту
    this.orbits[name].add(this.axes[name]);

    // добавление орбиты в солнечную систему
    this.solarSystem.add(this.orbits[name]);

    // скорость вращения вокруг своей оси
    this.objects[name].rotationSpeed = rotationSpeed;

    // скорость вращение вокруг солнца
    this.orbits[name].orbitSpeed = orbitSpeed;
  }

  addStars() {
    const starCount = 1000; // Количество звезд
    const minDistance = 1000; // Минимальный радиус от центра солнечной системы
    const maxDistance = 2000; // Максимальный радиус

    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Генерируем случайные сферические координаты
      const r = THREE.MathUtils.randFloat(minDistance, maxDistance); // Радиус
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2); // Угол (азимут)
      const phi = THREE.MathUtils.randFloat(0, Math.PI); // Угол (полярный)

      // Конвертируем сферические координаты в декартовы
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // Заполняем массив координат
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    // Создаем геометрию и материал для звезд
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1, // Размер точек
      sizeAttenuation: true, // Уменьшение размера с расстоянием
    });

    // Создаем и добавляем звезды в сцену
    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
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

    // перебор всех планет и их осей
    Object.keys(this.orbits).forEach((name) => {
      const orbit = this.orbits[name];
      const planet = this.objects[name];

      // движение по орбите
      orbit.rotation.y += orbit.orbitSpeed;

      // вращение вокруг своей оси
      planet.rotation.y += planet.rotationSpeed;
    });

    this.sunMaterial.uniforms.time.value = time;

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
  }
}

// setGui() {
//   const gui = new GUI();

//   // Создаем объект для хранения настроек
//   const params = {
//     fov: this.camera.fov, // Изначальное значение fov
//     near: this.camera.near,
//     far: this.camera.far,
//   };

//   // Добавляем контрол для изменения fov
//   gui.add(params, 'fov', 30, 120).onChange((value) => {
//     this.camera.fov = value; // Устанавливаем новое значение fov
//     this.camera.updateProjectionMatrix(); // Обновляем проекцию камеры
//   });

//   // Добавляем контрол для изменения fov
//   gui.add(params, 'near', 0.1, 10).onChange((value) => {
//     this.camera.near = value; // Устанавливаем новое значение fov
//     this.camera.updateProjectionMatrix(); // Обновляем проекцию камеры
//   });

//   // Добавляем контрол для изменения fov
//   gui.add(params, 'far', 5, 100).onChange((value) => {
//     this.camera.far = value; // Устанавливаем новое значение fov
//     this.camera.updateProjectionMatrix(); // Обновляем проекцию камеры
//   });
// }
