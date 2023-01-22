/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import {GlowFilter, TiltShiftFilter} from 'pixi-filters';
import {BlendFunction, BloomEffect, EffectPass} from 'postprocessing';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeCreate from '@/components/helpers/ThreeCreate.js';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';
import Tween from '@/components/helpers/Tween.js';
import Crystal from '@/components/projects/through-time/objects/Crystal.js';
import FlickerAnim from '@/components/projects/through-time/utils/FlickerAnim.js';

//----------------------------------
// Constants
//----------------------------------

/**
 * Intro Scene
 */
export default class SceneStore extends AbstractScene {
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
      outside: null,
      device: null,
      store: null,
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
    const {scene: renderScene, camera, post} = Projector.createRenderObject('canvas-store', sceneWidth, sceneHeight);

    // Add BloomEffect to a new EffectPass for the render object
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.MULTIPLY,
      mipmapBlur: true,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.1,
      intensity: 3,
    });
    post.effectPass = new EffectPass(camera, bloomEffect);

    // Create a new 2d scene
    const ccObjects = await PixiCanvas.create(sceneWidth, sceneHeight, {
      stores_base: '/assets/through-time/stores-base.png',
      stores_person_1: '/assets/through-time/stores-person-1.png',
      stores_person_2: '/assets/through-time/stores-person-2.png',
      stores_device_base: '/assets/through-time/stores-device-base.png',
      stores_device_base_1: '/assets/through-time/stores-device-base-1.png',
      stores_device_base_2: '/assets/through-time/stores-device-base-2.png',
      stores_device_1: '/assets/through-time/stores-device-1.png',
      stores_device_2: '/assets/through-time/stores-device-2.png',
      stores_device_3: '/assets/through-time/stores-device-3.png',
      stores_back: '/assets/through-time/stores-back.png',
      stores_left_1: '/assets/through-time/stores-left-1.png',
      stores_left_2: '/assets/through-time/stores-left-2.png',
      stores_left_3: '/assets/through-time/stores-left-3.png',
      stores_right_1: '/assets/through-time/stores-right-1.png',
      stores_right_2: '/assets/through-time/stores-right-2.png',
      store_clean: '/assets/through-time/store-clean.png',
      store_destroyed: '/assets/through-time/store-destroyed.png',
      store_case_01: '/assets/through-time/store-case-01.png',
      store_case_02: '/assets/through-time/store-case-02.png',
      store_case_03: '/assets/through-time/store-case-03.png',
      store_case_04: '/assets/through-time/store-case-04.png',
      store_case_05: '/assets/through-time/store-case-05.png',
      store_lights_01: '/assets/through-time/store-lights-01.png',
      store_lights_02: '/assets/through-time/store-lights-02.png',
      store_lights_03: '/assets/through-time/store-lights-03.png',
      store_lights_04: '/assets/through-time/store-lights-04.png',
      store_lights_05: '/assets/through-time/store-lights-05.png',
      crystal_big_01: '/assets/through-time/crystal-big-01.png',
      crystal_big_02: '/assets/through-time/crystal-big-02.png',
      crystal_big_03: '/assets/through-time/crystal-big-03.png',
      crystal_small_01: '/assets/through-time/crystal-small-01.png',
      crystal_small_02: '/assets/through-time/crystal-small-02.png',
      crystal_small_03: '/assets/through-time/crystal-small-03.png',
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

    this.objects2d.outside = this.createOutsideScene();
    this.objects2d.device = this.createDeviceScene();
    this.objects2d.store = this.createStoreScene();
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

  /**
   * @private
   * @returns {Container<DisplayObject>}
   */
  createOutsideScene() {
    const tween = this.tween;
    const assets = PixiCanvas.assets;
    const container = new PIXI.Container();
    this.objects2d.container.addChild(container);
    const base = PIXI.Sprite.from(assets.stores_base);
    const back = PIXI.Sprite.from(assets.stores_back);
    const left1 = PIXI.Sprite.from(assets.stores_left_1);
    const left2 = PIXI.Sprite.from(assets.stores_left_2);
    const left3 = PIXI.Sprite.from(assets.stores_left_3);
    const right1 = PIXI.Sprite.from(assets.stores_right_1);
    const right2 = PIXI.Sprite.from(assets.stores_right_2);

    const person1 = PIXI.Sprite.from(assets.stores_person_1);
    const person2 = PIXI.Sprite.from(assets.stores_person_2);
    person2.alpha = 0;

    container.addChild(base);
    container.addChild(back);

    container.addChild(person1);
    container.addChild(person2);

    container.addChild(left3);
    container.addChild(left1);
    container.addChild(left2);
    container.addChild(right2);
    container.addChild(right1);


    // tween.to(person2, { alpha: 0.4, duration: 2, repeat: -1, yoyo: true });
    tween.fromTo(base, {alpha: 0.9}, {alpha: 1, duration: 2, repeat: -1, yoyo: true});
    FlickerAnim.add('storesFlick1', back, 'alpha', 0, 0.5, 250, 1000);
    FlickerAnim.add('storesFlick2', left1, 'alpha', 0, 0.5, 250, 1000);
    FlickerAnim.add('storesFlick3', left2, 'alpha', 0, 0.5, 250, 1000);
    FlickerAnim.add('storesFlick4', left3, 'alpha', 0, 0.5, 250, 1000);
    FlickerAnim.add('storesFlick5', right2, 'alpha', 0, 0.5, 250, 1000);
    FlickerAnim.add('storesFlick6', right1, 'alpha', 0, 0.5, 250, 1000);
    return {
      container,
      person: person2,
    };
  }

  createDeviceScene() {
    const assets = PixiCanvas.assets;
    const container = new PIXI.Container();
    this.objects2d.container.addChild(container);

    const tiltShift = new TiltShiftFilter(6.6, 555);
    tiltShift.blendMode = PIXI.BLEND_MODES.COLOR_BURN;
    container.filters = [tiltShift];

    const deviceBase = PIXI.Sprite.from(assets.stores_device_base);
    const deviceBase1 = PIXI.Sprite.from(assets.stores_device_base_1);
    const deviceBase2 = PIXI.Sprite.from(assets.stores_device_base_2);
    const device1 = PIXI.Sprite.from(assets.stores_device_1);
    const device2 = PIXI.Sprite.from(assets.stores_device_2);
    const device3 = PIXI.Sprite.from(assets.stores_device_3);

    deviceBase.scale.set(2, 2);
    deviceBase1.scale.set(2, 2);
    deviceBase2.scale.set(2, 2);
    device1.scale.set(2, 2);
    device2.scale.set(2, 2);
    device3.scale.set(2, 2);

    deviceBase1.alpha = 0;
    deviceBase2.alpha = 0;
    device1.alpha = 0;
    device2.alpha = 0;
    device3.alpha = 0;

    container.addChild(deviceBase);
    container.addChild(deviceBase1);
    container.addChild(deviceBase2);
    container.addChild(device1);
    container.addChild(device2);
    container.addChild(device3);

    container.alpha = 0;
    return {
      container,
      devices: [device1, device2, device3],
      bases: [deviceBase1, deviceBase2],
    };
  }

  /**
   * @private
   */
  createStoreScene() {
    const assets = PixiCanvas.assets;
    const container = new PIXI.Container();
    this.objects2d.container.addChild(container);
    const destroyed = PIXI.Sprite.from(assets.store_destroyed);
    const clean = PIXI.Sprite.from(assets.store_clean);
    const case01 = PIXI.Sprite.from(assets.store_case_01);
    const case02 = PIXI.Sprite.from(assets.store_case_02);
    const case03 = PIXI.Sprite.from(assets.store_case_03);
    const case04 = PIXI.Sprite.from(assets.store_case_04);
    const case05 = PIXI.Sprite.from(assets.store_case_05);
    const lights01 = PIXI.Sprite.from(assets.store_lights_01);
    const lights02 = PIXI.Sprite.from(assets.store_lights_02);
    const lights03 = PIXI.Sprite.from(assets.store_lights_03);
    const lights04 = PIXI.Sprite.from(assets.store_lights_04);
    const lights05 = PIXI.Sprite.from(assets.store_lights_05);


    const flash = new PIXI.Graphics();
    flash.beginFill(0xFFFFFF);
    flash.drawRect(0, 0, this.width, this.height);
    flash.endFill();
    flash.alpha = 0;

    const crystal = new Crystal('small', 0x8bd9df);
    crystal.position.set(765, 290);
    crystal.scale.set(0.6, 0.6);

    case01.position.set(731, 150);
    case02.position.set(799, 144);
    case03.position.set(722, 221);
    case04.position.set(721, 281);
    case05.position.set(810, 203);
    case01.anchor.set(0.5, 0.5);
    case02.anchor.set(0.5, 0.5);
    case03.anchor.set(0.5, 0.5);
    case04.anchor.set(0.5, 0.5);
    case05.anchor.set(0.5, 0.5);

    lights01.position.set(192, 304);
    lights02.position.set(392, 292);
    lights03.position.set(584, 272);
    lights04.position.set(680, 200);
    lights05.position.set(680, 300);

    lights01.blendMode = PIXI.BLEND_MODES.DARKEN;
    lights02.blendMode = PIXI.BLEND_MODES.DARKEN;
    lights03.blendMode = PIXI.BLEND_MODES.DARKEN;
    lights04.blendMode = PIXI.BLEND_MODES.DARKEN;
    lights05.blendMode = PIXI.BLEND_MODES.DARKEN;

    const glowFilter = new GlowFilter({ distance: 20 });
    glowFilter.color = 0x0f3c6a;
    glowFilter.quality = 0.8;
    case01.filters = [glowFilter]
    case02.filters = [glowFilter]
    case03.filters = [glowFilter]
    case04.filters = [glowFilter]
    case05.filters = [glowFilter]

    case01.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
    case02.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
    case03.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
    case04.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
    case05.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;

    container.addChild(destroyed);
    container.addChild(lights01);
    container.addChild(lights02);
    container.addChild(lights03);
    container.addChild(lights04);
    container.addChild(lights05);
    container.addChild(case01);
    container.addChild(case02);
    container.addChild(case03);
    container.addChild(case04);
    container.addChild(case05);

    container.addChild(clean);
    container.addChild(flash);
    container.addChild(crystal);

    container.alpha = 0;

    return {
      storeScene: container,
      lights: [lights01, lights02, lights03, lights04, lights05],
      casePieces: [case01, case02, case03, case04, case05],
      bgBroken: destroyed,
      bgClean: clean,
      crystal,
      flash,
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
    const { container, devices, bases } = this.objects2d.device;

    const deviceDelay = 10;
    tween.to(container, { alpha: 1, duration: 2, delay: deviceDelay});
    tween.to(devices[0], { alpha: 1, duration: 1, delay: deviceDelay + 3});
    tween.to(devices[1], { alpha: 1, duration: 1, delay: deviceDelay + 4});
    tween.to(devices[2], { alpha: 1, duration: 0.5, delay: deviceDelay + 5});
    tween.to(devices[2], { alpha: 0, duration: 0.5, delay: deviceDelay + 5.5});

    tween.to(bases[0], { alpha: 1, duration: 0.5, delay: deviceDelay + 5.5 });
    tween.to(bases[1], { alpha: 1, duration: 0.5, delay: deviceDelay + 6, repeat: -1, yoyo: true });
    tween.to(devices[1], { alpha: 0, duration: 0.25, delay: deviceDelay + 5.75});
    tween.to(devices[0], { alpha: 0, duration: 0.25, delay: deviceDelay + 6});
  }

  showOutside() {
    const tween = this.tween;
    const { person } = this.objects2d.outside;
    const { container } = this.objects2d.device;
    tween.to(container, { alpha: 0, duration: 2});
    tween.to(person, { alpha: 1, duration: 2, repeat: -1, yoyo: true});
  }

  showInside() {
    const tween = this.tween;
    const { storeScene } = this.objects2d.store;
    const { container } = this.objects2d.outside;

    tween.to(storeScene, { alpha: 1, duration: 2, onComplete: () => {
        container.alpha = 0;
        FlickerAnim.remove('storesFlick1');
        FlickerAnim.remove('storesFlick2');
        FlickerAnim.remove('storesFlick3');
        FlickerAnim.remove('storesFlick4');
        FlickerAnim.remove('storesFlick5');
        FlickerAnim.remove('storesFlick6');
      }});
  }

  crystalPulse() {
    const { crystal } = this.objects2d.store;
    crystal.pulsate();
  }

  crystalHover() {
    const tween = this.tween;
    const { crystal } = this.objects2d.store;
    tween.to(crystal, { y: "-=40", duration: 3, ease: 'sine.inOut' });
    this.objects2d.crystalHover = tween.to(crystal, { y: "+=20", duration: 3, delay: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  crystalRotate() {
    const { crystal } = this.objects2d.store;
    crystal.startRotationAnimation();
  }
  explosion() {
    const tween = this.tween;
    const { lights, casePieces, bgBroken, bgClean, crystal, flash } = this.objects2d.store;

    lights.forEach((light, idx) => {
      FlickerAnim.add(`storelight-${idx}`, light, 'alpha', 1, 0.7, 250, 1000);
    });
    tween.fromTo(bgBroken, {alpha: 0.8}, {alpha: 1, duration: 2, repeat: -1, yoyo: true});
    tween.to(bgClean, {alpha: 0, duration: 0.2});
    tween.to(flash, {alpha: 1, duration: 0.01, delay: 0.02});
    tween.to(flash, {alpha: 0, duration: 1 });

    tween.to(casePieces[0], {x: 625, y: 160, angle: 10, duration: 1, ease: 'power1.out' });
    tween.to(casePieces[1], {x: 850, y: 210, angle: -10, duration: 1.1, ease: 'power1.out' });
    tween.to(casePieces[2], {x: 625, y: 280, angle: 10, duration: 1.2, ease: 'power1.out' });
    tween.to(casePieces[3], {x: 644, y: 370, angle: -10, duration: 1.4, ease: 'power1.out' });
    tween.to(casePieces[4], {x: 910, y: 320, angle: 15, duration: 1.3, ease: 'power1.out' });

    tween.to(casePieces[0], {y: '+=20', angle: 20, duration: 3, delay: 1, ease: 'sine.inOut', repeat: -1, yoyo: true});
    tween.to(casePieces[1], {y: '-=20', angle: -20, duration: 3, delay: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true });
    tween.to(casePieces[2], {y: '+=20', angle: 5, duration: 3, delay: 1.2, ease: 'sine.inOut', repeat: -1, yoyo: true});
    tween.to(casePieces[3], {y: '-=20', angle: 0, duration: 3, delay: 1.4, ease: 'sine.inOut', repeat: -1, yoyo: true});
    tween.to(casePieces[4], {y: '+=20', angle: 25, duration: 3, delay: 1.3, ease: 'sine.inOut', repeat: -1, yoyo: true});

    crystal.startGlowAnimation();
  }

  flyOutOfStore() {
    const tween = this.tween;
    const { crystal } = this.objects2d.store;
    this.objects2d.crystalHover.kill();
    tween.to(crystal, { y: -32, duration: 5, ease: 'sine.inOut' });
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  handleParameterChange(value) {
    switch (value) {
      case 0: {
        this.showOutside();
        break;
      }
      case 1: {
        this.showInside();
        break;
      }
      case 2: {
        this.crystalPulse();
        break;
      }
      case 3: {
        this.crystalHover();
        break;
      }
      case 4: {
        this.crystalRotate();
        break;
      }
      case 5: {
        this.explosion();
        break;
      }
      case 6: {
        this.flyOutOfStore();
        break;
      }
      default: {
        console.log('unmapped parameter:', value);
      }
    }
  }
}
