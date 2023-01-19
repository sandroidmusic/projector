/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ParticleSystem from '@/components/particles/ParticleSystem.js';
import ThreeTexture from '@/components/helpers/ThreeTexture.js';
import Random from '@/utils/Random.js';
import Particle from '@/components/particles/objects/Particle.js';
import ParticleEvent from '@/components/particles/objects/ParticleEvent.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
/** @type ParticleSystem */
let smoke;
/** @type ParticleSystem */
let spark;

/**
 * Fire Sparks Particles
 */
export default class SceneFireSparks extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------

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
    smoke.reset();
    spark.reset();
    spark.start();
    smoke.start();
  }

  stop() {
    smoke.off(ParticleEvent.COMPLETE);
    spark.off(ParticleEvent.COMPLETE);
    smoke.reset();
    spark.reset();
  }

  async setup() {
    const mainScene = Projector.getRenderScene('main');
    smoke = new ParticleSystem(await ThreeTexture.load.image('/assets/nightrider/particle-smoke.jpg'));
    spark = new ParticleSystem(await ThreeTexture.load.image('/assets/nightrider/particle-sparks.png'));
    mainScene.add(smoke);
    mainScene.add(spark);

    const NUM_PARTICLES = 1000;
    const width = (Projector.globals.tracker.width - 20) / 2;
    const height = (Projector.globals.tracker.height - 20) / 2;

    const z = -0.1;

    for (let i = 0; i < NUM_PARTICLES; i += 1) {
      let x = width;
      let y = height;
      let up = false;
      let left = false;

      if (Math.random() < 0.5) {
        up = Math.random() < 0.5;
        x = Random.float.minmax(-width, width);
        y = up ? -height : height;
      } else {
        left = Math.random() < 0.5;
        x = left ? -width : width;
        y = Random.float.minmax(-height, height);
      }

      smoke.addParticle(new Particle(
        new THREE.Vector3(x, y, z),
        THREE.MathUtils.DEG2RAD * Random.float.minmax(0, 360),
        Random.float.minmax(1, 40),
        0x333333,
        1,
        Random.float.minmax(0.25, 0.5),
        Math.random() * 360,
        0,
        Random.float.minmax(1, 1.005),
        Random.float.minmax(500, 1500),
      ));

      if (i % 2 === 1) {
        spark.addParticle(new Particle(
          new THREE.Vector3(x, y, z),
          THREE.MathUtils.RAD2DEG * Random.float.minmax(0, -45),
          Random.float.minmax(20, 40),
          0xFECB02,
          1,
          Random.float.minmax(0.25, 2),
          Math.random() * 360,
          -1,
          0.995,
          Random.float.minmax(500, 800),
        ));
      }
    }
  }

  destroy() {
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Render / Animation Methods
  //
  //---------------------------------------------------
  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  /**
   * Called whenever the Scene parameter gets updated
   */
  handleParameterChange() {
    smoke.reset();
    spark.reset();
    spark.start();
    smoke.start();
  }
}
