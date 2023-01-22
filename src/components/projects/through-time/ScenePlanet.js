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
export default class ScenePlanet extends AbstractScene {
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
    const {scene: renderScene, post} = Projector.createRenderObject('canvas-skyline', sceneWidth, sceneHeight);

    // Create a new 2d scene
    const ccObjects = await PixiCanvas.create(sceneWidth, sceneHeight, {
      maedow_1: '/assets/through-time/maedow-01.png',
      maedow_2: '/assets/through-time/maedow-02.png',
      crystal_shadow: '/assets/through-time/crystal-shadow.png',
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
    const tween = this.tween;
    const assets = PixiCanvas.assets;
    const container = new PIXI.Container();
    const flashContainer = new PIXI.Container();
    const starContainer = new PIXI.Container();
    this.objects2d.container.addChild(container);
    const first = PIXI.Sprite.from(assets.maedow_1);
    const second = PIXI.Sprite.from(assets.maedow_2);
    const crystal = new Crystal('small', 0x55F5FF);
    const shadow = PIXI.Sprite.from(assets.crystal_shadow);

    const flash1 = new PIXI.Graphics();
    const flash2 = new PIXI.Graphics();

    flash1.beginFill(0xFFFFFF);
    flash1.drawRect(0, 0, this.width * 2, this.width * 2);
    flash1.endFill();

    flash2.beginFill(0xFFFFFF);
    flash2.drawRect(0, 0, this.width * 2, this.width * 2);
    flash2.endFill();

    flash1.pivot.set(435, 145);
    flash2.pivot.set(435, 145);

    flash1.position.set(435,145);
    flash2.position.set(435,145);

    flashContainer.pivot.set(435, 145);
    flashContainer.position.set(435, 145);

    shadow.anchor.set(0.5, 0.5);
    shadow.scale.y = 0;
    shadow.scale.x = 0;
    shadow.position.set(435, 462);
    shadow.alpha = 0;
    shadow.angle = 90;


    crystal.position.set(435, 145);
    crystal.startRotationAnimation();
    crystal.scale.set(0.7, 0.7);

    container.addChild(first);
    container.addChild(second);
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
      quality: 0.01,
    });
    starContainer.filters = [glowFilter];

    container.addChild(shadow);
    container.addChild(crystal);
    container.addChild(flashContainer);
    flashContainer.addChild(flash1);
    flashContainer.addChild(flash2);

    tween.to(second, { alpha: 0, duration: 0.5, delay: 2, repeatDelay: 2, repeat: -1, yoyo: true, ease: 'sine.inOut'});
    return {
      crystal,
      flashContainer,
      flash1,
      flash2,
      shadow,
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
    const tween = this.tween;
    const { crystal, flashContainer, flash1, flash2, shadow } = this.objects2d.scene;

    this.crystalFloat = tween.to(crystal, { y: 125, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'});
    tween.to(flashContainer, { y: 125, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'});
    tween.to(flash1.scale, { x: 0.002, duration: 0.4, ease: 'power1.out'});
    tween.to(flash2.scale, { y: 0.002, duration: 0.4, ease: 'power1.out'});
    tween.to(flash1.scale, { y: 0, duration: 0.5, delay: 0.65, ease: 'power1.out'});
    tween.to(flash2.scale, { x: 0, duration: 0.5, delay: 0.65, ease: 'power1.out'});
    tween.to(flashContainer, { alpha: 0, angle: 90, duration: 5});


    /*
    tween.delayed(3, () => {
      crystalFloat.kill();
      tween.to(crystal, {y: 450, duration: 6, ease: 'sine.inOut' });
      crystal.stopGlowAnimation(8);
      tween.delayed(6, () => {
        crystal.stopRotationAnimation();
      })
      tween.to(crystal, { angle: 55, duration: 3, delay: 3, ease: 'sine.inOut' });
    });

    tween.delayed(3, () => {
      tween.to(shadow, { alpha: 0.5, duration: 6, ease: 'sine.inOut'});
      tween.to(shadow.scale, { x: 0.5, y: 0.5, duration: 3, ease: 'sine.inOut'});
      tween.to(shadow.scale, { y: 1.15, duration: 3, delay: 3, ease: 'sine.inOut'});
      tween.to(shadow, { x: 443, angle: 80, duration: 3, delay: 3, ease: 'sine.inOut'});
    });
    */
  }

  crystalPulse() {
    const { crystal } = this.objects2d.scene;
    crystal.pulsate();
  }

  layToRest() {
    const tween = this.tween;
    const { crystal, shadow } = this.objects2d.scene;

    this.crystalFloat.kill();
    tween.to(crystal, {y: 450, duration: 6, ease: 'sine.inOut' });
    crystal.stopGlowAnimation(8);
    tween.delayed(6, () => {
      crystal.stopRotationAnimation();
    })
    tween.to(crystal, { angle: 55, duration: 3, delay: 3, ease: 'sine.inOut' });

    tween.to(shadow, { alpha: 0.5, duration: 6, ease: 'sine.inOut'});
    tween.to(shadow.scale, { x: 0.5, y: 0.5, duration: 3, ease: 'sine.inOut'});
    tween.to(shadow.scale, { y: 1.15, duration: 3, delay: 3, ease: 'sine.inOut'});
    tween.to(shadow, { x: 443, angle: 80, duration: 3, delay: 3, ease: 'sine.inOut'});
  }

  startGlow() {
    const { crystal } = this.objects2d.scene;
    crystal.startGlowAnimation(200, 0, 15);
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  handleParameterChange(value) {
    switch (value) {
      case 0: {
        this.crystalPulse();
        break;
      }
      case 1: {
        this.layToRest();
        break;
      }
      case 2: {
        this.startGlow();
        break;
      }
      default: {
        console.log('unmapped parameter:', value);
      }
    }
  }
}
