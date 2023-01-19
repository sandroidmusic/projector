/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeMaterial from '@/components/helpers/ThreeMaterial.js';
import Tween from '@/components/helpers/Tween.js';
import ThreeCreate from '@/components/helpers/ThreeCreate.js';
import * as THREE from 'three';
import MidiController from '@/components/controllers/midi/MidiController.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Example Scene - How to use video
 */
export default class SceneVideosOutro extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.scene = null;
    this.items = [];
    this.renderMaterial = null;
    this.tween = new Tween();
    this.skullTween = null;
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
    Projector.outputEncoding = THREE.LinearEncoding;
    const tracker = Projector.globals.tracker;
    tracker.body.border.visible = false;
    tracker.functionKeys.visible = false;
    tracker.screenKeys.visible = false;
    tracker.navigationKeys.visible = false;
    tracker.screen.border.visible = false;
    tracker.jogWheel.visible = false;
    tracker.padsGrid.visible = false;
    tracker.body.fill.material = this.renderMaterial;
  }

  stop() {
    this.tween.killAll();
    const tracker = Projector.globals.tracker;
    tracker.body.border.visible = true;
    tracker.jogWheel.visible = true;
    tracker.padsGrid.visible = true;
    tracker.screen.visible = true;
    tracker.navigationKeys.visible = true;
    tracker.functionKeys.borders.visible = true;
    tracker.screenKeys.visible = true;
    Projector.globals.tracker.resetMaterials();
  }

  async setup() {
    const items = [];
    const { width: sceneWidth, height: sceneHeight } = Projector.globals.tracker;
    const { scene, post } = Projector.createRenderObject('videos', sceneWidth, sceneHeight);
    this.scene = scene;

    const fireball = await ThreeMaterial.load.video('/assets/nightrider/video-ball-of-fire.mp4', true);
    fireball.video.currentTime = 2;
    ThreeMaterial.repeat(fireball.material, 0.8, 1);
    const fbPlane = ThreeCreate.plane({
      size: { x: sceneWidth, y: sceneHeight, z: 1 },
      material: fireball.material,
    });
    fbPlane.position.z = 0.03;
    fbPlane.visible = false;
    scene.add(fbPlane);
    items.push({ plane: fbPlane, material: fireball.material, video: fireball.video });

    const hisparks = await ThreeMaterial.load.video('/assets/nightrider/video-sparks-02.mp4', true);
    const hsPlane = ThreeCreate.plane({
      size: { x: sceneWidth, y: sceneHeight, z: 1 },
      material: hisparks.material,
    });
    hsPlane.position.z = 0.02;
    hsPlane.visible = false;
    scene.add(hsPlane);
    items.push({ plane: hsPlane, material: hisparks.material, video: hisparks.video });

    const losparks = await ThreeMaterial.load.video('/assets/nightrider/video-sparks-01.mp4', true);
    const lsPlane = ThreeCreate.plane({
      size: { x: sceneWidth, y: sceneHeight, z: 1 },
      material: losparks.material,
    });
    lsPlane.position.z = 0.01;
    lsPlane.visible = false;
    scene.add(lsPlane);
    items.push({ plane: lsPlane, material: losparks.material, video: losparks.video });

    this.items = items;
    this.renderMaterial = new THREE.MeshBasicMaterial({ map: post.savePass.renderTarget.texture });
  }

  destroy() {
    this.tween = null;
    this.scene.clear();
    this.scene = null;
    this.items = null;
    this.renderMaterial = null;
    this.skullTween = null;
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
   * @param {Number} value
   * @param {Boolean} retriggered
   */
  handleParameterChange(value, retriggered = false) {
    const item = this.items[value];
    if (value === 0) {
      item.plane.visible = true;
      item.video.play();
      this.tween.to(item.material, { opacity: 0, duration: 2, ease: 'power4.in',onComplete: () => {
          item.video.pause();
          item.plane.visible = false;
      }});

      const under = this.items[1];
      under.video.currentTime = 0;
      under.video.play();
      under.plane.visible = true;
    }

    if (value === 1) {
      this.tween.to(item.material, { opacity: 0, duration: 2, ease: 'none', onComplete: () => {
        item.video.pause();
        item.plane.visible = false;
      }});

      const under = this.items[2];
      under.video.currentTime = 0;
      under.video.play();
      under.plane.visible = true;

      this.tween.to(under.material, { opacity: 0, duration: MidiController.barLength * 12, ease: 'none', onComplete: () => {
        item.video.pause();
        item.plane.visible = false;
      }});
    }
  }
}
