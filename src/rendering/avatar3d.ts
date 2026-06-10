import Phaser from "phaser";
import * as THREE from "three";
import { avatarFacingYaw } from "./avatar-facing";
import type { AnimationKey, AttackType, FighterConfig } from "../types";

const AVATAR_TEXTURE_SIZE = 320;

export interface Avatar3DFrameState {
  x: number;
  y: number;
  facing: -1 | 1;
  animation: AnimationKey;
  attack: AttackType | "idle";
  airborne: boolean;
  shielding: boolean;
  stunned: boolean;
  ultReady: boolean;
  alpha: number;
  timeMs: number;
}

type Joint = THREE.Group;

interface AvatarRig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftUpperArm: Joint;
  leftForearm: Joint;
  rightUpperArm: Joint;
  rightForearm: Joint;
  leftUpperLeg: Joint;
  leftLowerLeg: Joint;
  rightUpperLeg: Joint;
  rightLowerLeg: Joint;
  weapon: THREE.Group;
  aura: THREE.PointLight;
}

export class BattleAvatar3D {
  readonly image: Phaser.GameObjects.Image;

  private readonly textureKey: string;
  private readonly textureCanvas: HTMLCanvasElement;
  private readonly textureContext: CanvasRenderingContext2D;
  private readonly webglCanvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly texture: Phaser.Textures.CanvasTexture;
  private readonly scene3d = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1.05, 1.05, 2.18, -0.28, 0.1, 40);
  private readonly rig: AvatarRig;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly config: FighterConfig,
    private readonly playerNumber: 1 | 2,
    x: number,
    y: number
  ) {
    this.textureKey = `avatar3d-${config.id}-${playerNumber}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    this.textureCanvas = document.createElement("canvas");
    this.textureCanvas.width = AVATAR_TEXTURE_SIZE;
    this.textureCanvas.height = AVATAR_TEXTURE_SIZE;

    const context = this.textureCanvas.getContext("2d", { willReadFrequently: false });
    if (!context) throw new Error("Could not create 2D texture context for 3D avatar.");
    this.textureContext = context;

    this.webglCanvas = document.createElement("canvas");
    this.webglCanvas.width = AVATAR_TEXTURE_SIZE;
    this.webglCanvas.height = AVATAR_TEXTURE_SIZE;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.webglCanvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(AVATAR_TEXTURE_SIZE, AVATAR_TEXTURE_SIZE, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const texture = scene.textures.addCanvas(this.textureKey, this.textureCanvas);
    if (!texture) throw new Error(`Could not register avatar texture ${this.textureKey}.`);
    this.texture = texture;

    this.camera.position.set(0, 1.04, 6.2);
    this.camera.lookAt(0, 1.02, 0);
    this.scene3d.add(this.camera);
    this.createLighting();

    this.rig = this.createRig(config);
    this.scene3d.add(this.rig.root);

    this.image = scene.add.image(x, y - 14, this.textureKey);
    this.image.setDisplaySize(176, 214);
    this.image.setDepth(12);
    this.image.setOrigin(0.5, 0.61);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  update(state: Avatar3DFrameState): void {
    this.image.setPosition(state.x, state.y - 22);
    this.image.setAlpha(state.alpha);
    this.image.setDisplaySize(state.ultReady ? 184 : 176, state.ultReady ? 224 : 214);

    this.poseRig(state);
    this.renderer.render(this.scene3d, this.camera);
    this.textureContext.clearRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
    this.textureContext.imageSmoothingEnabled = true;
    this.textureContext.drawImage(this.webglCanvas, 0, 0);
    this.texture.refresh();
  }

  destroy(): void {
    if (!this.image.scene) return;

    this.image.destroy();
    this.scene.textures.remove(this.textureKey);
    this.disposeObject(this.scene3d);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private createLighting(): void {
    this.scene3d.add(new THREE.HemisphereLight(0xfff1d4, 0x242b45, 1.72));
    this.scene3d.add(new THREE.AmbientLight(0xd8e2ff, 0.32));

    const key = new THREE.DirectionalLight(0xffdfb5, 2.35);
    key.position.set(-4.2, 4.8, 5.4);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    this.scene3d.add(key);

    const rim = new THREE.DirectionalLight(this.config.accent, 1.35);
    rim.position.set(4.8, 2.7, -3.9);
    this.scene3d.add(rim);

    const fill = new THREE.PointLight(0x9dbdff, 0.75, 7);
    fill.position.set(0, 1.1, 3.4);
    this.scene3d.add(fill);
  }

  private createRig(config: FighterConfig): AvatarRig {
    const root = new THREE.Group();
    root.position.y = -0.08;
    root.scale.set(0.92, 0.96, 0.92);

    const skin = new THREE.MeshStandardMaterial({
      color: this.skinTone(config),
      roughness: 0.82,
      metalness: 0.01
    });
    const armor = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.5,
      metalness: 0.28
    });
    const accent = new THREE.MeshStandardMaterial({
      color: config.accent,
      emissive: config.accent,
      emissiveIntensity: 0.08,
      roughness: 0.42,
      metalness: 0.38
    });
    const cloth = new THREE.MeshStandardMaterial({
      color: this.mixColor(config.color, 0x24273b, 0.46),
      roughness: 0.91,
      metalness: 0.02
    });
    const dark = new THREE.MeshStandardMaterial({
      color: this.mixColor(config.accent, 0x090b14, 0.68),
      roughness: 0.86,
      metalness: 0.04
    });
    const leather = new THREE.MeshStandardMaterial({
      color: this.mixColor(0x5c3528, config.color, 0.12),
      roughness: 0.9,
      metalness: 0.04
    });
    const hair = new THREE.MeshStandardMaterial({
      color: this.hairColor(config),
      roughness: 0.78,
      metalness: 0.03
    });

    const torso = new THREE.Group();
    torso.position.set(0, 1.1, 0);
    root.add(torso);

    const chest = this.mesh(new THREE.CapsuleGeometry(0.34, 0.46, 10, 24), armor);
    chest.scale.set(1.08, 1.08, 0.54);
    torso.add(chest);

    const breastplate = this.mesh(new THREE.SphereGeometry(0.25, 28, 16), accent);
    breastplate.position.set(0, 0.12, 0.25);
    breastplate.scale.set(config.id === "heracles" ? 1.24 : 1.08, 0.74, 0.18);
    torso.add(breastplate);

    const tunic = this.mesh(new THREE.CylinderGeometry(0.36, 0.48, 0.52, 30), cloth);
    tunic.position.y = -0.45;
    tunic.scale.z = 0.52;
    torso.add(tunic);

    const belt = this.mesh(new THREE.TorusGeometry(0.34, 0.026, 8, 32), accent);
    belt.position.y = -0.28;
    belt.rotation.x = Math.PI / 2;
    torso.add(belt);

    const leftShoulder = this.mesh(new THREE.SphereGeometry(0.14, 20, 12), accent);
    leftShoulder.position.set(-0.43, 0.3, 0.02);
    leftShoulder.scale.set(1.35, 0.58, 0.82);
    torso.add(leftShoulder);

    const rightShoulder = this.mesh(new THREE.SphereGeometry(0.14, 20, 12), accent);
    rightShoulder.position.set(0.43, 0.3, 0.02);
    rightShoulder.scale.set(1.35, 0.58, 0.82);
    torso.add(rightShoulder);

    const cape = this.mesh(
      new THREE.PlaneGeometry(0.78, 1.02, 1, 3),
      new THREE.MeshStandardMaterial({
        color: this.mixColor(config.accent, 0x141827, 0.52),
        roughness: 0.94,
        metalness: 0.01,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide
      })
    );
    cape.position.set(0, -0.22, -0.26);
    cape.rotation.x = 0.1;
    torso.add(cape);

    const head = new THREE.Group();
    head.position.set(0, 1.76, 0.04);
    root.add(head);

    const neck = this.mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.18, 16), skin);
    neck.position.y = -0.22;
    head.add(neck);

    const face = this.mesh(new THREE.SphereGeometry(0.225, 28, 20), skin);
    face.scale.set(0.88, 1.08, 0.82);
    head.add(face);

    const hairCap = this.mesh(new THREE.SphereGeometry(0.238, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), hair);
    hairCap.position.y = 0.08;
    hairCap.scale.set(0.96, 0.62, 0.92);
    head.add(hairCap);

    if (config.id === "zeus" || config.id === "poseidon" || config.id === "hades") {
      const beard = this.mesh(new THREE.CapsuleGeometry(0.105, 0.19, 8, 16), hair);
      beard.position.set(0, -0.18, 0.19);
      beard.rotation.x = -0.18;
      head.add(beard);
    }

    if (config.id === "athena" || config.id === "ares" || config.id === "achilles") {
      const helmet = this.mesh(new THREE.SphereGeometry(0.25, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), accent);
      helmet.position.y = 0.12;
      helmet.scale.set(0.98, 0.65, 0.92);
      head.add(helmet);

      const crest = this.mesh(new THREE.BoxGeometry(0.07, 0.32, 0.12), dark);
      crest.position.set(0, 0.28, -0.02);
      crest.rotation.x = -0.08;
      head.add(crest);
    }

    this.addFace(head);

    const leftUpperArm = this.createArm(-1, skin, armor);
    const rightUpperArm = this.createArm(1, skin, armor);
    torso.add(leftUpperArm, rightUpperArm);

    const leftForearm = leftUpperArm.children.find((child) => child.name === "forearm") as THREE.Group;
    const rightForearm = rightUpperArm.children.find((child) => child.name === "forearm") as THREE.Group;

    const leftUpperLeg = this.createLeg(-1, leather, armor);
    const rightUpperLeg = this.createLeg(1, leather, armor);
    root.add(leftUpperLeg, rightUpperLeg);

    const leftLowerLeg = leftUpperLeg.children.find((child) => child.name === "lower-leg") as THREE.Group;
    const rightLowerLeg = rightUpperLeg.children.find((child) => child.name === "lower-leg") as THREE.Group;

    const weapon = this.createWeapon(config, accent, armor, leather);
    weapon.position.set(0.02, -0.48, 0.11);
    rightForearm.add(weapon);

    if (config.id === "athena") {
      const shield = this.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.045, 36), accent);
      shield.rotation.x = Math.PI / 2;
      shield.position.set(-0.03, -0.3, 0.22);
      leftForearm.add(shield);

      const shieldFace = this.mesh(new THREE.CircleGeometry(0.2, 36), armor);
      shieldFace.position.set(-0.03, -0.3, 0.248);
      leftForearm.add(shieldFace);
    }

    if (config.id === "heracles") {
      const pelt = this.mesh(new THREE.SphereGeometry(0.26, 18, 12), leather);
      pelt.position.set(-0.18, 0.42, 0.12);
      pelt.scale.set(1.2, 0.5, 0.42);
      torso.add(pelt);
    }

    const aura = new THREE.PointLight(config.accent, 0.45, 3.5);
    aura.position.set(0, 1.2, 1.2);
    root.add(aura);

    const groundShadow = this.mesh(
      new THREE.CircleGeometry(0.48, 40),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
    );
    groundShadow.position.set(0, 0.02, -0.04);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.scale.z = 0.34;
    root.add(groundShadow);

    return {
      root,
      torso,
      head,
      leftUpperArm,
      leftForearm,
      rightUpperArm,
      rightForearm,
      leftUpperLeg,
      leftLowerLeg,
      rightUpperLeg,
      rightLowerLeg,
      weapon,
      aura
    };
  }

  private createArm(side: -1 | 1, skin: THREE.Material, armor: THREE.Material): THREE.Group {
    const upper = new THREE.Group();
    upper.position.set(side * 0.43, 0.22, 0.02);

    const upperMesh = this.mesh(new THREE.CapsuleGeometry(0.072, 0.34, 8, 16), armor);
    upperMesh.position.y = -0.23;
    upper.add(upperMesh);

    const forearm = new THREE.Group();
    forearm.name = "forearm";
    forearm.position.y = -0.48;
    upper.add(forearm);

    const lowerMesh = this.mesh(new THREE.CapsuleGeometry(0.064, 0.3, 8, 16), skin);
    lowerMesh.position.y = -0.2;
    forearm.add(lowerMesh);

    const bracer = this.mesh(new THREE.CylinderGeometry(0.078, 0.066, 0.12, 16), armor);
    bracer.position.y = -0.31;
    forearm.add(bracer);

    const hand = this.mesh(new THREE.SphereGeometry(0.07, 16, 12), skin);
    hand.position.y = -0.4;
    forearm.add(hand);

    upper.rotation.z = side * 0.22;
    forearm.rotation.z = side * 0.12;
    return upper;
  }

  private createLeg(side: -1 | 1, leather: THREE.Material, armor: THREE.Material): THREE.Group {
    const upper = new THREE.Group();
    upper.position.set(side * 0.18, 0.72, 0);

    const thigh = this.mesh(new THREE.CapsuleGeometry(0.086, 0.38, 8, 16), armor);
    thigh.position.y = -0.28;
    upper.add(thigh);

    const lower = new THREE.Group();
    lower.name = "lower-leg";
    lower.position.y = -0.56;
    upper.add(lower);

    const shin = this.mesh(new THREE.CapsuleGeometry(0.07, 0.32, 8, 16), leather);
    shin.position.y = -0.22;
    lower.add(shin);

    const greave = this.mesh(new THREE.CylinderGeometry(0.082, 0.068, 0.18, 16), armor);
    greave.position.y = -0.2;
    lower.add(greave);

    const boot = this.mesh(new THREE.BoxGeometry(0.15, 0.075, 0.28), leather);
    boot.position.set(0, -0.42, 0.08);
    lower.add(boot);

    return upper;
  }

  private createWeapon(
    config: FighterConfig,
    accent: THREE.Material,
    armor: THREE.Material,
    leather: THREE.Material
  ): THREE.Group {
    const weapon = new THREE.Group();
    weapon.rotation.z = -0.34;

    const rod = (height: number, radius = 0.025, material: THREE.Material = leather) => {
      const mesh = this.mesh(new THREE.CylinderGeometry(radius, radius, height, 12), material);
      mesh.position.y = height / 2 - 0.04;
      return mesh;
    };

    if (config.projectile === "bolt") {
      const points = [
        new THREE.Vector3(-0.07, 0.55, 0),
        new THREE.Vector3(0.09, 0.27, 0.01),
        new THREE.Vector3(-0.02, 0.18, 0),
        new THREE.Vector3(0.12, -0.18, 0.02),
        new THREE.Vector3(-0.09, 0.02, 0)
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const bolt = this.mesh(new THREE.TubeGeometry(curve, 18, 0.028, 8, false), accent);
      weapon.add(bolt);
      return weapon;
    }

    if (config.projectile === "spear" || config.id === "athena" || config.id === "achilles") {
      weapon.add(rod(0.98, 0.018, leather));
      const tip = this.mesh(new THREE.ConeGeometry(0.075, 0.2, 18), accent);
      tip.position.y = 0.96;
      weapon.add(tip);
      return weapon;
    }

    if (config.projectile === "wave") {
      weapon.add(rod(1.0, 0.02, leather));
      [-0.12, 0, 0.12].forEach((offset) => {
        const prong = this.mesh(new THREE.ConeGeometry(0.04, 0.22, 14), accent);
        prong.position.set(offset, 1.02, 0);
        prong.rotation.z = -offset * 1.7;
        weapon.add(prong);
      });
      return weapon;
    }

    if (config.projectile === "arrow") {
      const bow = this.mesh(new THREE.TorusGeometry(0.34, 0.018, 10, 28, Math.PI * 1.3), accent);
      bow.rotation.z = Math.PI * 0.5;
      bow.position.set(0.02, 0.22, 0);
      weapon.add(bow);
      weapon.add(rod(0.76, 0.012, leather));
      return weapon;
    }

    if (config.projectile === "rock") {
      const club = this.mesh(new THREE.CapsuleGeometry(0.08, 0.52, 8, 16), leather);
      club.position.y = 0.28;
      club.scale.set(1.35, 1, 1.35);
      weapon.add(club);
      return weapon;
    }

    if (config.projectile === "shadow") {
      weapon.add(rod(0.9, 0.019, leather));
      const orb = this.mesh(new THREE.SphereGeometry(0.1, 18, 12), accent);
      orb.position.y = 0.86;
      weapon.add(orb);
      return weapon;
    }

    const blade = this.mesh(new THREE.BoxGeometry(0.08, 0.64, 0.035), armor);
    blade.position.y = 0.34;
    weapon.add(blade);
    const hilt = this.mesh(new THREE.BoxGeometry(0.28, 0.045, 0.05), accent);
    hilt.position.y = 0.03;
    weapon.add(hilt);
    return weapon;
  }

  private addFace(head: THREE.Group): void {
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1e2d });
    const leftEye = this.mesh(new THREE.SphereGeometry(0.018, 10, 8), eyeMaterial);
    const rightEye = this.mesh(new THREE.SphereGeometry(0.018, 10, 8), eyeMaterial);
    leftEye.position.set(-0.068, 0.035, 0.188);
    rightEye.position.set(0.068, 0.035, 0.188);
    head.add(leftEye, rightEye);

    const nose = this.mesh(new THREE.ConeGeometry(0.016, 0.055, 8), new THREE.MeshStandardMaterial({ color: 0xb87954 }));
    nose.position.set(0, -0.025, 0.205);
    nose.rotation.x = Math.PI / 2;
    head.add(nose);
  }

  private poseRig(state: Avatar3DFrameState): void {
    const t = state.timeMs / 1000;
    const run = state.animation === "run";
    const swing = run ? Math.sin(t * 11.5) : Math.sin(t * 2.3) * 0.12;
    const breathe = Math.sin(t * 2.4) * 0.018;
    const facingTurn = avatarFacingYaw(state.facing);
    const attackWindup = Math.sin(t * 16) * 0.18;

    this.rig.root.rotation.set(0, facingTurn, 0);
    this.rig.root.position.y = -0.08 + (state.airborne ? 0.1 : 0) + (run ? Math.abs(Math.sin(t * 11.5)) * 0.035 : breathe);
    this.rig.root.scale.setScalar(state.stunned ? 0.97 : 1);
    this.rig.torso.rotation.set(0, 0, 0);
    this.rig.head.rotation.set(0, 0, 0);

    this.setRestPose();

    if (run) {
      this.rig.leftUpperArm.rotation.x = -swing * 0.48;
      this.rig.rightUpperArm.rotation.x = swing * 0.48;
      this.rig.leftUpperLeg.rotation.x = swing * 0.62;
      this.rig.rightUpperLeg.rotation.x = -swing * 0.62;
      this.rig.leftLowerLeg.rotation.x = Math.max(0, -swing) * 0.72;
      this.rig.rightLowerLeg.rotation.x = Math.max(0, swing) * 0.72;
      this.rig.torso.rotation.z = -swing * 0.025;
    }

    if (state.airborne) {
      this.rig.leftUpperArm.rotation.x = -0.42;
      this.rig.rightUpperArm.rotation.x = -0.52;
      this.rig.leftUpperLeg.rotation.x = -0.28;
      this.rig.rightUpperLeg.rotation.x = 0.34;
      this.rig.leftLowerLeg.rotation.x = 0.48;
      this.rig.rightLowerLeg.rotation.x = 0.36;
    }

    if (state.animation === "quick") {
      this.rig.rightUpperArm.rotation.set(-0.28, 0.35, -0.92 + attackWindup);
      this.rig.rightForearm.rotation.set(-0.2, 0.15, -0.72);
      this.rig.torso.rotation.y = -state.facing * 0.18;
    }

    if (state.animation === "heavy") {
      this.rig.rightUpperArm.rotation.set(-0.8, 0.25, -1.35);
      this.rig.rightForearm.rotation.set(-0.36, 0.1, -0.95 - attackWindup);
      this.rig.leftUpperArm.rotation.set(-0.25, -0.3, 0.56);
      this.rig.torso.rotation.z = state.facing * 0.12;
    }

    if (state.animation === "special" || state.animation === "ult") {
      const power = state.animation === "ult" ? 1 : 0.72;
      this.rig.rightUpperArm.rotation.set(-1.1 * power, 0.12, -0.68);
      this.rig.rightForearm.rotation.set(-0.45, 0.2, -0.22);
      this.rig.leftUpperArm.rotation.set(-0.72 * power, -0.12, 0.58);
      this.rig.leftForearm.rotation.set(-0.2, -0.08, 0.36);
      this.rig.head.rotation.x = -0.1;
      this.rig.root.position.y += Math.sin(t * 18) * (state.animation === "ult" ? 0.035 : 0.016);
    }

    if (state.shielding) {
      this.rig.leftUpperArm.rotation.set(-0.2, -0.35, 0.92);
      this.rig.leftForearm.rotation.set(-0.1, -0.16, 0.54);
      this.rig.torso.rotation.x = -0.08;
    }

    if (state.stunned || state.animation === "hurt") {
      this.rig.root.rotation.z = state.facing * 0.12;
      this.rig.torso.rotation.x = 0.16;
      this.rig.head.rotation.x = 0.2;
      this.rig.leftUpperArm.rotation.set(0.35, 0.2, 1.08);
      this.rig.rightUpperArm.rotation.set(0.2, -0.2, -1.08);
    }

    this.rig.weapon.rotation.y = Math.sin(t * 7) * (state.ultReady ? 0.14 : 0.04);
    this.rig.aura.intensity = state.ultReady ? 2.4 + Math.sin(t * 9) * 0.45 : state.attack !== "idle" ? 1.1 : 0.38;
  }

  private setRestPose(): void {
    this.rig.leftUpperArm.rotation.set(0, 0, 0.24);
    this.rig.leftForearm.rotation.set(0, 0, 0.12);
    this.rig.rightUpperArm.rotation.set(0, 0, -0.24);
    this.rig.rightForearm.rotation.set(0, 0, -0.12);
    this.rig.leftUpperLeg.rotation.set(0, 0, 0.06);
    this.rig.leftLowerLeg.rotation.set(0, 0, 0);
    this.rig.rightUpperLeg.rotation.set(0, 0, -0.06);
    this.rig.rightLowerLeg.rotation.set(0, 0, 0);
  }

  private mesh<T extends THREE.BufferGeometry>(geometry: T, material: THREE.Material): THREE.Mesh<T, THREE.Material> {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private mixColor(color: number, mixWith: number, amount: number): number {
    return new THREE.Color(color).lerp(new THREE.Color(mixWith), amount).getHex();
  }

  private hairColor(config: FighterConfig): number {
    if (config.id === "zeus" || config.id === "poseidon") return 0xf4f0df;
    if (config.id === "hades") return 0x1b1830;
    if (config.id === "artemis" || config.id === "odysseus") return 0x2f241d;
    if (config.id === "athena" || config.id === "achilles") return 0x6f5135;
    return 0x221715;
  }

  private skinTone(config: FighterConfig): number {
    if (config.id === "hades") return 0xbda0c8;
    if (config.id === "poseidon") return 0xd1b08f;
    if (config.id === "athena" || config.id === "artemis") return 0xd99f72;
    return 0xc98b62;
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else if (material) {
        material.dispose();
      }
    });
  }
}

export function createBattleAvatar3D(
  scene: Phaser.Scene,
  config: FighterConfig,
  playerNumber: 1 | 2,
  x: number,
  y: number
): BattleAvatar3D | undefined {
  try {
    return new BattleAvatar3D(scene, config, playerNumber, x, y);
  } catch (error) {
    console.warn("3D avatar renderer unavailable; falling back to sprite avatars.", error);
    return undefined;
  }
}
