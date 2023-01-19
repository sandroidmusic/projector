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
import MidiController from '@/components/controllers/midi/MidiController.js';

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
let kickTween;
let snareTween;

/**
 * Shaderball Scene
 */
export default class SceneShaderBall extends AbstractScene {
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
    const tracker = Projector.globals.tracker;
    tracker.body.resetMaterials();
    tracker.body.fill.material = this.renderMaterial;
    tracker.body.border.visible = true;
    tracker.body.borderColor = 0x000000;
    tracker.navigationKeys.visible = false;
    tracker.functionKeys.visible = false;
    tracker.screenKeys.visible = false;
    tracker.screen.border.visible = false;
    tracker.jogWheel.visible = false;
    tracker.padsGrid.visible = false;

    this.render();
    tween.to(mesh.rotation, {
      x: THREE.MathUtils.DEG2RAD * 0.1,
      y: THREE.MathUtils.DEG2RAD * 0.25,
      repeat: -1,
      duration: 8,
    });
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
    mesh.position.set(80, -61, 0);
    scene.add(mesh);
    this.renderMaterial = new THREE.MeshBasicMaterial({ map: post.savePass.renderTarget.texture });
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
      glitchShader.time += 0.8;
    };
    rraf = requestAnimationFrame(run);
  }
  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  /**
   * Called whenever the Scene parameter gets updated
   * @param {Number} value
   */
  handleParameterChange(value) {
    const tracker = Projector.globals.tracker;
    if (kickTween) {
      kickTween.kill();
    }
    if (snareTween) {
      snareTween.kill();
    }
    tracker.body.fill.material = this.renderMaterial;
    if (value === 1 || value === 4) {
      tween.fromTo(
        testShader,
        { animationTime: 0.6 },
        { animationTime: 0.8, duration: MidiController.beatLength },
      );
    }
    if (value === 2) {
      tween.fromTo(
        testShader,
        { animationTime: 0 },
        { animationTime: 0.95, duration: MidiController.beatLength },
      );
    }
    if (value === 3) {
      tracker.body.fill.material = glitchShader.material;
    }
  }
}
