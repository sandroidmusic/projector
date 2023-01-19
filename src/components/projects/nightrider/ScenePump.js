/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import Tween from '@/components/helpers/Tween.js';
import ThreeMaterial from '@/components/helpers/ThreeMaterial.js';
import MidiController from '@/components/controllers/midi/MidiController.js';
import MidiEvent from '@/components/controllers/midi/objects/MidiEvent.js';
import {BlendFunction, BloomEffect, EffectPass} from 'postprocessing';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Rotate asset textures positioned on a grid
 */
export default class ScenePump extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.tween = new Tween();
    this.planes = null;
    this.material = null;
    this.group = null;
    this.renderMaterial = null;
    this.rotation = 0;
    this.rotationTween = null;
    this.rotationEvent = null;
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
    const tracker = Projector.globals.tracker;
    Projector.outputEncoding = THREE.LinearEncoding;
    tracker.padsGrid.visible = false;
    tracker.functionKeys.visible = true;
    tracker.screenKeys.visible = true;
    tracker.navigationKeys.visible = true;
    tracker.body.fill.material = this.renderMaterial;
    tracker.jogWheel.visible = false;
    this.rotationEvent = this.animateRotation.bind(this);
    MidiController.on(MidiEvent.BEAT, this.rotationEvent);
    this.tween.fromTo(
      this.group.scale,
      { x: 50, y: 50 },
      { x: 500, y: 500, duration: MidiController.barLength * 12, ease: 'none'},
    );
    this.tween.fromTo(
      this.group.rotation,
      { z: 0 },
      { z: THREE.MathUtils.DEG2RAD * -360, duration: MidiController.barLength * 12, ease: 'none'},
    );
  }

  stop() {
    this.tween.killAll();
    Projector.outputEncoding = THREE.sRGBEncoding;
    Projector.globals.tracker.resetMaterials();
    MidiController.off(MidiEvent.BEAT, this.rotationEvent);
  }

  async setup() {
    const { width: sceneWidth, height: sceneHeight } = Projector.globals.tracker;
    const { scene, camera, post } = Projector.createRenderObject('scope', sceneWidth, sceneHeight);

    // Add BloomEffect to a new EffectPass for the render object
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.7,
      intensity: 2.0,
    });
    post.effectPass = new EffectPass(camera, bloomEffect);


    const group = new THREE.Group();
    group.position.x = 15;
    group.position.y = 15;
    group.scale.x = 100;
    group.scale.y = 100;

    const gridX = 7;
    const gridY = 7;
    this.material = await ThreeMaterial.load.image('/assets/nightrider/geometry.jpg');
    const texture = this.material.map;
    texture.offset.x = 0;
    texture.offset.y = 0;

    texture.repeat.y = 0.3;
    texture.repeat.x = 0.5;

    ThreeMaterial.wrap(this.material, ThreeMaterial.WRAPMODES.CLAMP_TO_EDGE);

    // create planes
    this.planes = [];
    const planeGeometry = new THREE.PlaneGeometry();
    for (let incY = 0; incY < gridY; incY += 1) {
      for (let incX = 0; incX < gridX; incX += 1) {
        const mesh = new THREE.Mesh(planeGeometry, this.material);
        this.planes[`${incY}-${incX}`] = mesh;
        group.add(mesh);
      }
    }

    // update planes
    let flipY = true;
    let flipX = true;
    let y = -gridY / 2;
    let x = 0;
    for (let incY = 0; incY < gridY; incY += 1) {
      x = -gridX / 2;
      for (let incX = 0; incX < gridX; incX += 1) {
        const mesh = this.planes[`${incY}-${incX}`];
        mesh.position.set(x, y, 1);
        mesh.scale.set((flipX) ? -1 : 1, (flipY) ? -1 : 1, 1);
        flipX = !flipX;
        x += 1;
      }
      y += 1;
      flipY = !flipY;
      flipX = !flipX;
    }

    scene.add(group);
    this.group = group;
    this.renderMaterial = new THREE.MeshBasicMaterial({ map: post.savePass.renderTarget.texture });
  }

  destroy() {
    this.tween = null;
    this.planes = null;
    this.material = null;
    this.renderMaterial = null;
    this.rotation = null;
    this.renderMaterial = null;
    this.rotationEvent = null;
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
  animateRotation() {
    const texture = this.material.map;
    this.rotation -= 0.25;
    if (this.rotation <= -360) {
      this.rotation = 0;
    }
    if (this.rotationTween) {
      this.rotationTween.kill();
    }
    this.rotationTween = this.tween.to(texture, {
      rotation: this.rotation,
      duration: MidiController.beatLength,
      ease: 'elastic.out(0.8, 0.4)',
    });
  }
}
