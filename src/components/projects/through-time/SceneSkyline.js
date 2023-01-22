/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import {GlowFilter} from 'pixi-filters';
import {BlendFunction, BloomEffect, EffectPass} from 'postprocessing';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeCreate from '@/components/helpers/ThreeCreate.js';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';
import Tween from '@/components/helpers/Tween.js';
import Crystal from '@/components/projects/through-time/objects/Crystal.js';
import SkylineStar from '@/components/projects/through-time/objects/SkylineStar.js';
import Random from '@/utils/Random.js';

//----------------------------------
// Constants
//----------------------------------

/**
 * Intro Scene
 */
export default class SceneSkyline extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.width = 1024;
    this.height = 566;
    this.tween = new Tween();
    this.canvas = null;
    this.objects2d = {
      container: null,
      scene: null,
    };
    this.objects3d = {
      plane: null,
      texture: null,
    };
    this.timeoutId = null;
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
    Projector.globals.tracker.visible = false;
    this.objects3d.plane.visible = true;
    this.startRender(this.render);
    this.animate();
  }

  stop() {
    this.objects3d.plane.visible = false;
    this.stopRender();
    this.tween.killAll();
    clearTimeout(this.timeoutId);
    Projector.globals.tracker.visible = true;
  }

  async setup() {
    const sceneWidth = this.width;
    const sceneHeight = this.height;

    // Retrieve main 3d scene
    const mainScene = Projector.getRenderScene('main');
    // Create a new render object
    const {scene: renderScene, camera, post} = Projector.createRenderObject('canvas-skyline', sceneWidth, sceneHeight);

    // Add BloomEffect to a new EffectPass for the render object
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.MULTIPLY,
      mipmapBlur: true,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.2,
      intensity: 2.0,
    });
    post.effectPass = new EffectPass(camera, bloomEffect);

    // Create a new 2d scene
    const ccObjects = await PixiCanvas.create(sceneWidth, sceneHeight, {
      skyline_back: '/assets/through-time/skyline-back.png',
      skyline_front: '/assets/through-time/skyline-front.png',
    });

    // let's add one container where we add all objects
    const container = new PIXI.Container();
    container.position.set(0, 0);
    ccObjects.canvas.stage.addChild(container);

    this.canvas = ccObjects.canvas;
    this.objects2d.container = container;
    this.objects3d.texture = ccObjects.texture;

    // Let's add a Plane to the main scene
    const plane = ThreeCreate.plane({
      size: {x: sceneWidth, y: sceneHeight, z: 0},
      position: {x: 0, y: 0, z: 0},
    });
    plane.visible = false;
    plane.material = new THREE.MeshBasicMaterial({map: post.savePass.renderTarget.texture});
    mainScene.add(plane);
    this.objects3d.plane = plane;

    // now let's create another plane in it, where the 2d content is rendered
    const renderPlane = ThreeCreate.plane({
      position: {x: 0, y: 0, z: -579},
      size: {x: sceneWidth, y: sceneHeight, z: 0},
      color: 0x000000,
    });
    renderScene.add(renderPlane);
    renderPlane.material = new THREE.MeshBasicMaterial({map: ccObjects.texture});

    this.objects2d.scene = this.createSkylineScene();
  }

  destroy() {
    PixiCanvas.destroy(this.canvas);
    this.tween = null;
    this.canvas = null;
    this.objects2d = null;
    this.objects3d = null;
    this.timeoutId = null;
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  createSkylineScene() {
    const assets = PixiCanvas.assets;
    const container = new PIXI.Container();
    const starContainer = new PIXI.Container();
    this.objects2d.container.addChild(container);
    const back = PIXI.Sprite.from(assets.skyline_back);
    const front = PIXI.Sprite.from(assets.skyline_front);
    const crystal = new Crystal('small', 0x55F5FF);

    back.y = -(back.height - this.height);
    front.y = back.y;

    crystal.position.set(495, this.height);
    crystal.startRotationAnimation();
    crystal.startGlowAnimation(200, 5, 15);
    crystal.scale.set(0.25, 0.25);

    container.addChild(back);
    container.addChild(starContainer);

    for (let i = 0; i < 100; i += 1) {
      const star = new SkylineStar();
      const x = Random.int.minmax(0, 1024);
      const y = Random.int.minmax(-512, 150);
      star.position.set(x, y);
      starContainer.addChild(star);
    }

    const glowFilter = new GlowFilter({
      distance: 2,
      outerStrength: 2,
      color: 0x8bd9df,
      quality: 0.1,
    });
    starContainer.filters = [glowFilter];

    container.addChild(crystal);
    container.addChild(front);

    return {
      crystal,
      back,
      front,
      starContainer,
    }
  }

  //---------------------------------------------------
  //
  //  Render / Animation Methods
  //
  //---------------------------------------------------
  /** @private */
  render() {
    this.canvas.render();
    this.objects3d.texture.needsUpdate = true;
  }

  /** @private */
  animate() {
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  handleParameterChange(value) {
    if (value === 0) {
      const tween = this.tween;
      const { crystal, back, front, starContainer } = this.objects2d.scene;
      tween.to(crystal, { y: this.height / 2, duration: 4, ease: 'sine.out'});
      tween.to(back, { y: -50, duration: 10, delay: 2, ease: 'sine.in' });
      tween.to(starContainer, { y: 512, duration: 12, delay: 2, ease: 'sine.in'});
      tween.to(front, { y: 0, duration: 10, delay: 2, ease: 'sine.in' });
      tween.to(crystal, { y: -100, duration: 5, delay: 6, ease: 'sine.in'});
    }
  }
}
