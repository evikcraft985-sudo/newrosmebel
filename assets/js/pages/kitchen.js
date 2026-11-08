import {
  THREE,
  addShadow,
  createRenderLoop,
  createStage,
  makeBox,
  makeCylinder,
  setFallback,
  setReady,
} from '../core/stage.js';

const FINISHES = {
  olive: { color: '#66705a', label: 'Олива' },
  sand: { color: '#c0a583', label: 'Песок' },
  clay: { color: '#a9654d', label: 'Глина' },
};

export async function init(viewport) {
  const stage = createStage(viewport, {
    background: '#dfe1d6',
    cameraPosition: [7.8, 5.6, 8.6],
    target: [0, 1.05, 0],
    fov: 34,
    environmentIntensity: 0.72,
    minDistance: 6,
    maxDistance: 17,
  });
  const { scene } = stage;
  scene.fog = new THREE.Fog('#dfe1d6', 15, 30);

  const cabinetMaterial = new THREE.MeshStandardMaterial({
    color: FINISHES.olive.color,
    roughness: 0.58,
    metalness: 0.02,
  });
  const cabinetBodyMaterial = new THREE.MeshStandardMaterial({ color: '#4d5547', roughness: 0.75 });
  const stoneMaterial = new THREE.MeshStandardMaterial({ color: '#333a36', roughness: 0.28 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#eeeae0', roughness: 0.94 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#b6a78f', roughness: 0.72 });
  const metalMaterial = new THREE.MeshStandardMaterial({ color: '#b49a67', roughness: 0.25, metalness: 0.82 });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: '#141817', roughness: 0.18, metalness: 0.35 });
  const steelMaterial = new THREE.MeshStandardMaterial({ color: '#aab2af', roughness: 0.2, metalness: 0.9 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: '#916e4d', roughness: 0.64 });
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: '#f2d79b',
    emissive: '#ffd88c',
    emissiveIntensity: 1.2,
    roughness: 0.4,
  });

  const root = new THREE.Group();
  root.rotation.y = -0.08;
  scene.add(root);

  const floor = makeBox(10, 0.12, 8.5, floorMaterial, 0);
  floor.position.set(0, -0.08, 0.4);
  root.add(floor);

  const backWall = makeBox(9.4, 4.8, 0.14, wallMaterial, 0);
  backWall.position.set(0, 2.35, -2.75);
  root.add(backWall);

  const sideWall = makeBox(0.14, 4.8, 6.7, wallMaterial, 0);
  sideWall.position.set(-4.62, 2.35, 0.52);
  root.add(sideWall);

  const explodable = [];
  const registerExplodable = (object, offset) => {
    object.userData.closedPosition = object.position.clone();
    object.userData.openPosition = object.position.clone().add(offset);
    explodable.push(object);
    return object;
  };

  const addHandle = (parent, position, vertical = false) => {
    const handle = makeBox(vertical ? 0.035 : 0.38, vertical ? 0.38 : 0.035, 0.045, metalMaterial, 0.012);
    handle.position.fromArray(position);
    parent.add(handle);
    return handle;
  };

  const addBackCabinet = (x, upper = false) => {
    const y = upper ? 2.85 : 0.57;
    const height = upper ? 1.1 : 1.08;
    const body = makeBox(1.28, height, 0.82, cabinetBodyMaterial);
    body.position.set(x, y, -1.95);
    root.add(body);

    const front = makeBox(1.21, height - 0.08, 0.065, cabinetMaterial);
    front.position.set(x, y, -1.51);
    addHandle(front, [0.39, upper ? -0.32 : 0.32, 0.055]);
    registerExplodable(front, new THREE.Vector3(0, upper ? 0.22 : 0, 0.65));
    root.add(front);
  };

  [-2.72, -1.36, 0, 1.36, 2.72].forEach((x) => {
    addBackCabinet(x);
    if (x < 2) addBackCabinet(x, true);
  });

  const backCounter = makeBox(6.85, 0.11, 0.96, stoneMaterial);
  backCounter.position.set(0, 1.16, -1.94);
  registerExplodable(backCounter, new THREE.Vector3(0, 0.4, 0));
  root.add(backCounter);

  [-0.62, 0.72, 2.06].forEach((z) => {
    const body = makeBox(0.84, 1.08, 1.27, cabinetBodyMaterial);
    body.position.set(-3.77, 0.57, z);
    root.add(body);

    const front = makeBox(0.065, 1, 1.2, cabinetMaterial);
    front.position.set(-3.31, 0.57, z);
    addHandle(front, [0.055, 0.32, -0.39]);
    registerExplodable(front, new THREE.Vector3(0.62, 0, 0));
    root.add(front);
  });

  const sideCounter = makeBox(0.98, 0.11, 3.96, stoneMaterial);
  sideCounter.position.set(-3.76, 1.16, 0.72);
  registerExplodable(sideCounter, new THREE.Vector3(0, 0.4, 0));
  root.add(sideCounter);

  const fridge = makeBox(1.25, 2.78, 0.92, steelMaterial);
  fridge.position.set(3.82, 1.4, -1.96);
  root.add(fridge);
  const fridgeLine = makeBox(1.12, 0.025, 0.04, blackMaterial, 0);
  fridgeLine.position.set(3.82, 1.64, -1.48);
  root.add(fridgeLine);
  addHandle(root, [3.48, 1.96, -1.44], true);
  addHandle(root, [3.48, 1.19, -1.44], true);

  const oven = makeBox(1.03, 0.72, 0.08, blackMaterial);
  oven.position.set(0, 0.62, -1.45);
  root.add(oven);
  const ovenGlass = makeBox(0.83, 0.42, 0.02, new THREE.MeshStandardMaterial({
    color: '#263233', roughness: 0.08, metalness: 0.5,
  }));
  ovenGlass.position.set(0, 0.55, -1.395);
  root.add(ovenGlass);

  const cooktop = makeBox(1.18, 0.035, 0.72, blackMaterial);
  cooktop.position.set(0, 1.235, -1.92);
  root.add(cooktop);
  for (const x of [-0.32, 0.32]) {
    for (const z of [-2.12, -1.74]) {
      const burner = makeCylinder(0.16, 0.16, 0.018, steelMaterial, 32);
      burner.position.set(x, 1.262, z);
      root.add(burner);
    }
  }

  const islandBody = makeBox(3.1, 1.02, 1.08, cabinetMaterial);
  islandBody.position.set(0.62, 0.55, 1.36);
  registerExplodable(islandBody, new THREE.Vector3(0, -0.12, 0.3));
  root.add(islandBody);
  const islandTop = makeBox(3.4, 0.12, 1.34, stoneMaterial);
  islandTop.position.set(0.62, 1.12, 1.36);
  registerExplodable(islandTop, new THREE.Vector3(0, 0.42, 0));
  root.add(islandTop);

  const sink = makeBox(0.84, 0.045, 0.58, steelMaterial, 0.06);
  sink.position.set(0.08, 1.2, 1.35);
  root.add(sink);
  const sinkInner = makeBox(0.66, 0.025, 0.42, blackMaterial, 0.05);
  sinkInner.position.set(0.08, 1.23, 1.35);
  root.add(sinkInner);
  const faucet = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.028, 12, 36, Math.PI),
    steelMaterial,
  );
  faucet.position.set(0.08, 1.48, 1.03);
  faucet.rotation.x = Math.PI / 2;
  root.add(faucet);

  for (const x of [-0.45, 0.55, 1.55]) {
    const stoolSeat = makeCylinder(0.28, 0.28, 0.12, woodMaterial);
    stoolSeat.position.set(x, 0.72, 2.55);
    root.add(stoolSeat);
    const stoolLeg = makeCylinder(0.055, 0.075, 0.7, blackMaterial, 16);
    stoolLeg.position.set(x, 0.34, 2.55);
    root.add(stoolLeg);
    const stoolFoot = makeCylinder(0.24, 0.24, 0.035, blackMaterial, 24);
    stoolFoot.position.set(x, 0.02, 2.55);
    root.add(stoolFoot);
  }

  for (const x of [-0.35, 1.55]) {
    const cord = makeCylinder(0.012, 0.012, 1.45, blackMaterial, 8);
    cord.position.set(x, 3.75, 1.34);
    root.add(cord);
    const shade = makeCylinder(0.07, 0.3, 0.3, blackMaterial, 32);
    shade.position.set(x, 3.02, 1.34);
    root.add(shade);
    const bulb = makeCylinder(0.19, 0.19, 0.025, lampMaterial, 32);
    bulb.position.set(x, 2.86, 1.34);
    root.add(bulb);
  }

  const board = makeBox(0.56, 0.035, 0.4, woodMaterial, 0.04);
  board.position.set(1.42, 1.22, 1.38);
  board.rotation.y = -0.22;
  root.add(board);
  const fruitMaterial = new THREE.MeshStandardMaterial({ color: '#cb7747', roughness: 0.7 });
  for (const [x, z] of [[1.3, 1.32], [1.52, 1.42], [1.46, 1.23]]) {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), fruitMaterial);
    fruit.position.set(x, 1.32, z);
    fruit.castShadow = true;
    root.add(fruit);
  }

  addShadow(stage, { intensity: 2.6, position: [3, 8, 5] });
  const fill = new THREE.DirectionalLight('#dce8ff', 0.85);
  fill.position.set(-5, 4, 1);
  scene.add(fill);
  const warm = new THREE.PointLight('#ffd599', 18, 8, 2);
  warm.position.set(0.6, 2.75, 1.3);
  scene.add(warm);

  let exploded = false;
  let transitionActive = false;
  const loop = createRenderLoop(stage, (delta, time, motion) => {
    transitionActive = false;
    for (const object of explodable) {
      const target = exploded ? object.userData.openPosition : object.userData.closedPosition;
      const alpha = motion ? 1 - Math.exp(-7 * delta) : 1;
      object.position.lerp(target, alpha);
      if (object.position.distanceToSquared(target) > 0.00001) transitionActive = true;
    }
    return motion || transitionActive;
  });

  const shell = viewport.closest('[data-scene]');
  const status = shell.querySelector('[data-scene-status]');

  const setFinish = (key) => {
    const finish = FINISHES[key];
    if (!finish) return;
    cabinetMaterial.color.set(finish.color);
    shell.querySelectorAll('[data-finish]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.finish === key));
    });
    status.textContent = `Фасад: ${finish.label}. Материал и освещение обновлены в реальном времени.`;
    loop.request();
  };

  shell.querySelectorAll('[data-finish]').forEach((button) => {
    button.addEventListener('click', () => setFinish(button.dataset.finish));
  });

  const explodeButton = shell.querySelector('[data-explode]');
  explodeButton?.addEventListener('click', () => {
    exploded = !exploded;
    explodeButton.setAttribute('aria-pressed', String(exploded));
    explodeButton.textContent = exploded ? 'Собрать кухню' : 'Разобрать на части';
    status.textContent = exploded
      ? 'Конструкция разобрана: видны фасады, столешницы и корпус.'
      : 'Кухня снова собрана в единую композицию.';
    loop.request();
  });

  shell.querySelector('[data-reset-camera]')?.addEventListener('click', () => {
    stage.camera.position.set(7.8, 5.6, 8.6);
    stage.controls.target.set(0, 1.05, 0);
    stage.controls.update();
    status.textContent = 'Камера возвращена к общему виду кухни.';
    loop.request();
  });

  const motionButton = shell.querySelector('[data-motion]');
  const syncMotionButton = () => {
    motionButton?.setAttribute('aria-pressed', String(loop.motion));
    if (motionButton) motionButton.textContent = loop.motion ? 'Пауза' : 'Включить вращение';
  };
  motionButton?.addEventListener('click', () => {
    loop.setMotion(!loop.motion);
    syncMotionButton();
    status.textContent = loop.motion ? 'Медленное вращение включено.' : 'Вращение остановлено. Модель можно поворачивать вручную.';
  });
  syncMotionButton();

  viewport.addEventListener('scenecontextlost', () => {
    setFallback(viewport, '3D-контекст потерян. Показана статичная версия концепта.');
  });
  window.addEventListener('pagehide', () => loop.dispose(), { once: true });

  stage.renderer.render(scene, stage.camera);
  setReady(viewport, 'Олива выбрана. Поворачивайте модель или меняйте фасады.');
}
