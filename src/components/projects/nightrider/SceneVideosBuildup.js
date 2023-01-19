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
export default class SceneVideosBuildup extends AbstractScene {
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
    this.items.forEach((item) => {
      item.video.pause();
      item.plane.visible = false;
    });
  }

  async setup() {
    const items = [];
    const { width: sceneWidth, height: sceneHeight } = Projector.globals.tracker;
    const { scene, post } = Projector.createRenderObject('videos', sceneWidth, sceneHeight);
    this.scene = scene;

    const moon = await ThreeMaterial.load.video('/assets/nightrider/video-moon.mp4', true);
    ThreeMaterial.wrap(moon.material, ThreeMaterial.WRAPMODES.MIRRORED);
    ThreeMaterial.repeat(moon.material, 0.6, 0.8);
    ThreeMaterial.offset(moon.material, 0.1, -0.7);
    ThreeMaterial.opacity(moon.material, 0);
    const moonPlane = ThreeCreate.plane({
      size: { x: sceneWidth, y: sceneHeight, z: 1 },
      material: moon.material,
    });
    moonPlane.visible = false;
    scene.add(moonPlane);
    items.push({ plane: moonPlane, material: moon.material, video: moon.video });

    const losparks = await ThreeMaterial.load.video('/assets/nightrider/video-sparks-01.mp4', true);
    ThreeMaterial.opacity(losparks.material, 0);
    const lsPlane = ThreeCreate.plane({
      size: { x: sceneWidth, y: sceneHeight, z: 1 },
      material: losparks.material,
    });
    lsPlane.position.z = 0.01;
    lsPlane.visible = false;
    scene.add(lsPlane);
    items.push({ plane: lsPlane, material: losparks.material, video: losparks.video });

    const hisparks = await ThreeMaterial.load.video('/assets/nightrider/video-sparks-02.mp4', true);
    ThreeMaterial.opacity(hisparks.material, 0);
    const hsPlane = ThreeCreate.plane({
      size: { x: sceneWidth, y: sceneHeight, z: 1 },
      material: hisparks.material,
    });
    hsPlane.position.z = 0.02;
    hsPlane.visible = false;
    scene.add(hsPlane);
    items.push({ plane: hsPlane, material: hisparks.material, video: hisparks.video });

    const skull = await ThreeMaterial.load.video('/assets/nightrider/video-fireskull.mp4', true);
    ThreeMaterial.repeat(skull.material, 1, 1);
    ThreeMaterial.offset(skull.material, -0.18, -0.02);
    const skullPlane = ThreeCreate.plane({
      size: { x: sceneHeight * (16/9), y: sceneHeight, z: 1 },
      material: skull.material,
    });
    skullPlane.position.z = 0.03
    skullPlane.visible = false;
    scene.add(skullPlane);
    skull.video.currentTime = 0;
    items.push({ plane: skullPlane, material: skull.material, video: skull.video });

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
    const tracker = Projector.globals.tracker;
    const item = this.items[value];
    if (value === 0) {
      item.currentTime = 0;
      item.video.play();
      item.plane.visible = true;
      this.tween.to(item.material, { opacity: 1, duration: 2 });
    }

    if (value === 1) {
      item.currentTime = 0;
      item.video.play();
      item.plane.visible = true;
      tracker.padsGrid.visible = true;
      this.tween.to(item.material, { opacity: 1, duration: 2, onComplete: () => {
        const oldItem = this.items[0];
        oldItem.video.currentTime = 0;
        oldItem.video.pause();
        oldItem.plane.visible = false;
      }});
    }

    if (value === 2 && !retriggered) {
      tracker.screen.border.visible = false;
      tracker.navigationKeys.visible = true;
      tracker.functionKeys.visible = true;
      tracker.screenKeys.visible = true;
      tracker.navigationKeys.borderVisible = false;
      tracker.navigationKeys.fillVisible = true;
      tracker.functionKeys.borderVisible = false;
      tracker.screenKeys.borderVisible = false;
      item.currentTime = 0;
      item.video.play();
      item.plane.visible = true;
      this.tween.to(item.material, { opacity: 1, duration: MidiController.barLength * 3, onComplete: () => {
        const oldItem = this.items[1];
        oldItem.video.currentTime = 0;
        oldItem.video.pause();
        oldItem.plane.visible = false;
      }});
    }

    if (value === 3 && !retriggered) {
      item.plane.visible = true;
      item.video.currentTime = 0;
      item.video.play();
    }
    if (value === 3) {
      item.material.opacity = 1;
      item.video.currentTime = 0;
      if (this.skullTween) {
        this.skullTween.kill();
      }
      this.skullTween = this.tween.to(item.material, { opacity: 0, duration: 2, ease: 'linear'});
    }
  }
}
