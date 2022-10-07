/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import TestShader from '@/components/projects/examples/shaders/TestShader.js';
import GlitchShader from '@/components/projects/examples/shaders/GlitchShader.js';
import Tween from '@/components/helpers/Tween.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
let tween;
let mesh;
let testShader;
let glitchShader;
let rraf;

/**
 * Example Scene - How to use shaders
 */
export default class ExampleSceneShader extends AbstractScene {
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
    Projector.globals.tracker.body.fill.material = glitchShader.material;
    this.render();
    tween.to(mesh.rotation, {
      x: THREE.MathUtils.DEG2RAD * 0.1,
      y: THREE.MathUtils.DEG2RAD * 0.25,
      repeat: -1,
      duration: 8,
    });

    tween.fromTo(
      testShader,
      { animationTime: 0 },
      { animationTime: 0.8, duration: 2, repeat: -1 },
    );
  }

  stop() {
    Projector.globals.tracker.resetMaterials();
    tween.killAll();
    cancelAnimationFrame(rraf);
    rraf = null;
  }

  async setup() {
    const { scene, post } = Projector.createRenderObject('shader', 296, 206);

    glitchShader = new GlitchShader(0, post.savePass.renderTarget.texture);
    tween = new Tween();

    const geometry = new THREE.SphereGeometry(1, 128, 256);
    testShader = new TestShader();
    mesh = new THREE.Mesh(geometry, testShader.material);
    mesh.scale.set(20, 20, 20);
    mesh.position.set(60, 0, 0);
    scene.add(mesh);
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
  /** @private */
  render() {
    const run = () => {
      if (rraf !== null) {
        rraf = requestAnimationFrame(run);
      }
      testShader.time += 0.1;
      glitchShader.time += 0.05;
    };
    rraf = requestAnimationFrame(run);
  }
}
