/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeMaterial from '@/components/helpers/ThreeMaterial.js';
import ThreeCreate from '@/components/helpers/ThreeCreate.js';
import ParticleSystem from '@/components/particles/ParticleSystem.js';
import ThreeTexture from '@/components/helpers/ThreeTexture.js';
import Random from '@/utils/Random.js';
import Particle from '@/components/particles/objects/Particle.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Amiga Protracker Hommage
 */
export default class SceneBehringerTrucker extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.bodyMaterial = null;
    this.wheelMaterial = null;
    this.pipes = {};
    this.exhausts = {};
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  play() {
    const mainScene = Projector.getRenderScene('main');
    const tracker = Projector.globals.tracker;
    // tracker.body.border.visible = false;
    tracker.padsGrid.visible = true;
    tracker.screenKeys.borderVisible = false;
    tracker.screen.border.visible = false;
    tracker.navigationKeys.visible = false;
    tracker.functionKeys.visible = false;
    tracker.body.border.visible = false;
    tracker.body.fill.material = this.bodyMaterial;
    tracker.jogWheel.fill.material = this.wheelMaterial;
    tracker.padsGrid.borderVisible = false;

    const exhausts = this.exhausts;
    const pipes = this.pipes;

    mainScene.add(exhausts.left);
    mainScene.add(exhausts.right);
    mainScene.add(pipes.left);
    mainScene.add(pipes.right);
    exhausts.left.reset();
    exhausts.right.reset();
    exhausts.left.start();
    exhausts.right.start();
  }

  stop() {
    Projector.globals.tracker.resetMaterials();

    const mainScene = Projector.getRenderScene('main');
    const exhausts = this.exhausts;
    const pipes = this.pipes;
    exhausts.left.reset();
    exhausts.right.reset();
    mainScene.remove(exhausts.left);
    mainScene.remove(exhausts.right);
    mainScene.remove(pipes.left);
    mainScene.remove(pipes.right);
  }

  async setup() {
    this.bodyMaterial = await ThreeMaterial.load.image('/assets/nightrider/btrucker.jpg');
    this.wheelMaterial = await ThreeMaterial.load.image('/assets/nightrider/btrucker-wheel.png');

    const rightPipe = ThreeCreate.plane({
      size: { x: 25, y: 80, z: 0 },
      position: { x: 155, y: 30, z: 0 },
    });
    rightPipe.material = await ThreeMaterial.load.image('/assets/nightrider/btrucker-exhausts.png');

    const leftPipe = ThreeCreate.plane({
      size: { x: 25, y: 80, z: 0 },
      position: { x: -156, y: -30, z: 0 },
    });
    leftPipe.material = await ThreeMaterial.load.image('/assets/nightrider/btrucker-exhausts.png');
    leftPipe.material.map.repeat.x = -1;
    leftPipe.material.map.repeat.x = -1;

    this.pipes = {
      left: leftPipe,
      right: rightPipe,
    };

    const NUM_PARTICLES = 750;
    const smokeLeft = new ParticleSystem(await ThreeTexture.load.image('/assets/nightrider/particle-smoke-06.png'));
    const smokeRight = new ParticleSystem(await ThreeTexture.load.image('/assets/nightrider/particle-smoke-06.png'));

    this.exhausts = {
      left: smokeLeft,
      right: smokeRight,
    };

    for (let i = 0; i < NUM_PARTICLES; i += 1) {
      let x;
      let y;
      let z = 0;

      x = Random.float.minmax(-190, -156);
      y = Random.float.minmax(-60, 10);
      smokeLeft.addParticle(new Particle(
        new THREE.Vector3(x, y, z),
        THREE.MathUtils.DEG2RAD * Random.float.minmax(0, 360),
        Random.float.minmax(1, 40),
        0x222222,
        1,
        Random.float.minmax(0.25, 1.5),
        90,
        -0.5,
        Random.float.minmax(1, 1.005),
        Random.float.minmax(500, 1500),
      ));

      x = Random.float.minmax(155, 190);
      y = Random.float.minmax(10, 80);
      smokeRight.addParticle(new Particle(
        new THREE.Vector3(x, y, z),
        THREE.MathUtils.DEG2RAD * Random.float.minmax(0, 360),
        Random.float.minmax(1, 40),
        0x222222,
        1,
        Random.float.minmax(0.25, 1.5),
        45,
        -0.5,
        Random.float.minmax(1, 1.005),
        Random.float.minmax(500, 1500),
      ));
    }
  }

  destroy() {
    this.bodyMaterial = null;
    this.wheelMaterial = null;
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Animation / Render Handlers
  //
  //---------------------------------------------------
  render() {
  }
}
