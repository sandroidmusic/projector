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

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Rotate asset textures positioned on a grid
 */
export default class SceneAssetScope extends AbstractScene {
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
    tracker.body.fill.material = this.renderMaterial;
    tracker.jogWheel.visible = false;
    this.rotationEvent = this.animateRotation.bind(this);
    MidiController.on(MidiEvent.BEAT, this.rotationEvent);
    this.animateRotation();
    this.tween.fromTo(this.group.scale, { x: 150, y: 150 }, { x: 50, y: 50, duration: MidiController.barLength * 4});
  }

  stop() {
    this.tween.killAll();
    Projector.outputEncoding = THREE.sRGBEncoding;
    Projector.globals.tracker.resetMaterials();
    MidiController.off(MidiEvent.BEAT, this.rotationEvent);
  }

  async setup() {
    const { width: sceneWidth, height: sceneHeight } = Projector.globals.tracker;
    const { scene, post } = Projector.createRenderObject('scope', sceneWidth, sceneHeight);

    const group = new THREE.Group();
    group.scale.x = 100;
    group.scale.y = 100;

    const gridX = 7;
    const gridY = 7;
    this.material = await ThreeMaterial.load.image('/assets/nightrider/synth-sun.jpg');
    const texture = this.material.map;
    texture.offset.x = 0;
    texture.offset.y = -0.30;

    texture.repeat.y = 1;
    texture.repeat.x = 0.6;

    // ClampToEdgeWrapping, RepeatWrapping, MirroredRepeatWrapping
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;

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
      ease: 'power4.out',
    });
  }
}
