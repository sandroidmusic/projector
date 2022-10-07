/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeMaterial from '@/components/helpers/ThreeMaterial.js';
import Tween from '@/components/helpers/Tween.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
/** @type THREE.MeshBasicMaterial */
let material;
let tween;

/**
 * Example Scene - How to use images
 */
export default class ExampleSceneImage extends AbstractScene {
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
    Projector.globals.tracker.jogWheel.fill.material = material;
    /** @type THREE.Texture */
    const texture = material.map;
    texture.rotation = 0;
    tween.to(texture, {
      rotation: THREE.MathUtils.DEG2RAD * -359,
      repeat: -1,
      duration: 6,
      ease: 'linear',
    });
  }

  stop() {
    Projector.globals.tracker.resetMaterials();
    tween.killAll();
  }

  async setup() {
    tween = new Tween();
    material = await ThreeMaterial.load.image('/assets/examples/vinyl.png');
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
}
