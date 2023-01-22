/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import {AdvancedBloomFilter, TiltShiftFilter} from 'pixi-filters';
import {BlendFunction, BloomEffect, EffectPass} from 'postprocessing';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeCreate from '@/components/helpers/ThreeCreate.js';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';
import Tween from '@/components/helpers/Tween.js';
import Crystal from '@/components/projects/through-time/objects/Crystal.js';
import Random from '@/utils/Random.js';

//----------------------------------
// Constants
//----------------------------------

/**
 * Intro Scene
 */
export default class SceneSpace extends AbstractScene {
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
    this.assets = null;
    this.triggerOtherSpawn = false;
    this.objects2d = {
      container: null,
      starfield: {
        objects: [],
        cameraZ: 0,
        fov: 15,
        baseSpeed: 0.025,
        speed: 0,
        delta: 2,
        starStretch: 5,
        starBaseSize: 0.04,
      },
      otherfield: {
        objects: [],
        container: null,
        cameraZ: 0,
        fov: 100,
        baseSpeed: 0.025,
        speed: 0,
        delta: 5,
        starStretch: 0.5,
        starBaseSize: 0.5,
      },
      warpSpeed: 0,
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
    const {scene: renderScene, camera, post} = Projector.createRenderObject('canvas-space', sceneWidth, sceneHeight);

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
      object_0: '/assets/through-time/space-object-0.png',
      object_1: '/assets/through-time/space-object-1.png',
      object_2: '/assets/through-time/space-object-2.png',
      object_3: '/assets/through-time/space-object-3.png',
      object_4: '/assets/through-time/space-object-4.png',
      object_5: '/assets/through-time/space-object-5.png',
      object_6: '/assets/through-time/space-object-6.png',
      object_7: '/assets/through-time/space-object-7.png',
      object_8: '/assets/through-time/space-object-8.png',
      object_9: '/assets/through-time/space-object-9.png',
      object_10: '/assets/through-time/space-object-10.png',
      object_11: '/assets/through-time/space-object-11.png',
      object_12: '/assets/through-time/space-object-12.png',
      object_13: '/assets/through-time/space-object-13.png',
      object_14: '/assets/through-time/space-object-14.png',
      object_15: '/assets/through-time/space-object-15.png',
      object_16: '/assets/through-time/space-object-16.png',
      object_17: '/assets/through-time/space-object-17.png',
      object_18: '/assets/through-time/space-object-18.png',
      object_19: '/assets/through-time/space-object-19.png',
      object_20: '/assets/through-time/space-object-20.png',
      object_21: '/assets/through-time/space-object-21.png',
      object_22: '/assets/through-time/space-object-22.png',
      object_23: '/assets/through-time/space-object-23.png',
      object_24: '/assets/through-time/space-object-24.png',
      object_25: '/assets/through-time/space-object-25.png',
      object_26: '/assets/through-time/space-object-26.png',
      object_27: '/assets/through-time/space-object-27.png',
      object_28: '/assets/through-time/space-object-28.png',
      object_29: '/assets/through-time/space-object-29.png',
      star0: '/assets/through-time/star-01.png',
      star1: '/assets/through-time/star-02.png',
      star2: '/assets/through-time/star-03.png',
      star3: '/assets/through-time/star-04.png',
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

    this.objects2d.scene = this.createSpaceScene();
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

  createSpaceScene() {
    const container = new PIXI.Container();
    const tiltShift = new TiltShiftFilter(15.6, 750);
    tiltShift.blendMode = PIXI.BLEND_MODES.COLOR_BURN;
    container.filters = [tiltShift];
    this.objects2d.container.addChild(container);

    const flash = new PIXI.Graphics();
    flash.beginFill(0xFFFFFF);
    flash.drawRect(0, 0, this.width, this.height);
    flash.alpha = 0;

    const others = new PIXI.Container();
    const bloomFilter = new AdvancedBloomFilter();
    others.filters = [bloomFilter];
    others.pivot.set(this.width / 1.85, this.height / 1.85);
    others.position.set(this.width / 2, this.height / 2);
    this.objects2d.otherfield.container = others;
    container.addChild(others);

    const starContainer = new PIXI.Container();
    starContainer.pivot.set(this.width / 1.85, this.height / 1.85);
    starContainer.position.set(this.width / 2, this.height / 2);

    const filter1 = new AdvancedBloomFilter();
    starContainer.filters = [filter1];
    container.addChild(starContainer);

    const numStars = 1500;
    for (let i = 0; i < numStars; i += 1) {
      const color = Random.float.minmax(0xFFFFAA, 0xFFFFFF);
      const sprite = new PIXI.Sprite.from(PixiCanvas.assets[`star${Random.int.minmax(0, 3)}`]);
      const object = { sprite, x: 0, y: 0, z: 0 };
      sprite.anchor.set(0.5, 0.8);
      sprite.tint = color;
      this.randomizeObjectPosition(this.objects2d.starfield, object, true);
      starContainer.addChild(sprite);
      this.objects2d.starfield.objects.push(object);
    }

    const numOthers = 29;
    for (let i = 0; i <= numOthers; i += 1) {
      const sprite = PIXI.Sprite.from(PixiCanvas.assets[`object_${i}`]);
      const object = { sprite, x: 0, y: 0, z: 0, origin: 0, active: null };
      sprite.anchor.set(0.5, 0.5);
      sprite.scale.set(0, 0);
      this.randomizeObjectPosition(this.objects2d.otherfield, object, true, true);
      this.objects2d.otherfield.objects.push(object);
    }

    const crystal = new Crystal('big', 0x55F5FF);
    container.addChild(crystal);
    crystal.scale.set(0.25, 0.25);
    crystal.alpha = 0;
    crystal.position.set(this.width / 2, this.height / 2);
    crystal.startRotationAnimation();
    crystal.startGlowAnimation(5, 1, 2);

    container.addChild(flash);
    this.tween.fromTo(crystal, { angle: 25 }, { angle: -25, duration: 6, delay: 1, repeat: -1, yoyo: true, ease: 'power1.inOut'});

    return {
      stars: starContainer,
      others,
      flash,
      crystal,
      tiltShift,
    }
  }

  randomizeObjectPosition(field, object, initial, others) {
    const { cameraZ } = field;
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    object.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;
    object.x = others ? this.width / 2 : Math.cos(deg) * distance;
    object.y = others ? this.height / 2 : Math.sin(deg) * distance;
    object.origin = object.z + 2000;
  }

  spawnObject() {
    const tween = this.tween;
    const { objects, container } = this.objects2d.otherfield;
    const index = Random.int.minmax(0, objects.length - 1);

    const object = objects[index];
    if (!object.active) {
      object.sprite.angle = Random.float.number(360);
      object.active = true;
      this.randomizeObjectPosition(this.objects2d.otherfield, object, true, true);
      container.addChildAt(object.sprite, 0);
      tween.fromTo(object.sprite, { alpha: 0 }, { alpha: 1, duration: 1, ease: 'sine.inOut' });
    }

    tween.delayed(Random.float.minmax(0.5), () => {
      this.spawnObject();
    });
  }

  //---------------------------------------------------
  //
  //  Render / Animation Methods
  //
  //---------------------------------------------------
  /** @private */
  render() {
    const { starfield, otherfield, warpSpeed } = this.objects2d;
    starfield.speed += (warpSpeed - starfield.speed) / 20;
    starfield.cameraZ += starfield.delta + 10 * (starfield.speed + starfield.baseSpeed);

    const numStars = starfield.objects.length;
    for (let i = 0; i < numStars; i += 1) {
      const obj = starfield.objects[i];
      const sprite = obj.sprite;
      if (obj.z < starfield.cameraZ) {
        this.randomizeObjectPosition(starfield, obj);
      }

      const z = obj.z - starfield.cameraZ;
      sprite.x = obj.x * (starfield.fov / z) * this.width + this.width / 2;
      sprite.y = obj.y * (starfield.fov / z) * this.width + this.height / 2;

      const dxCenter = sprite.x - this.width / 2;
      const dyCenter = sprite.y - this.height / 2;
      const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
      const distanceScale = Math.max(0, (2000 - z) / 2000);
      sprite.scale.x = distanceScale * starfield.starBaseSize;
      sprite.scale.y = distanceScale * starfield.starBaseSize + distanceScale * starfield.speed * starfield.starStretch * distanceCenter / this.width;
      sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }

    if (this.triggerOtherSpawn) {
      const clampedWarp = warpSpeed > 2.5 ? 2.5 : warpSpeed;
      otherfield.speed += (clampedWarp - otherfield.speed) / 20;
      otherfield.cameraZ += otherfield.delta + 10 * (otherfield.speed + otherfield.baseSpeed);

      const numOthers = otherfield.objects.length;
      for (let i = 0; i < numOthers; i += 1) {
        const obj = otherfield.objects[i];
        const sprite = obj.sprite;
        if (obj.z < otherfield.cameraZ) {
          if (obj.origin < otherfield.cameraZ) {
            obj.active = false;
            otherfield.container.removeChild(sprite);
          }
          this.randomizeObjectPosition(otherfield, obj);
        }

        const z = obj.z - otherfield.cameraZ;
        sprite.x = obj.x * (otherfield.fov / z) * this.width + this.width / 2;
        sprite.y = obj.y * (otherfield.fov / z) * this.width + this.height / 2;

        const dxCenter = sprite.x - this.width / 2;
        const dyCenter = sprite.y - this.height / 2;
        const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const distanceScale = Math.max(0, (2000 - z) / 2000);
        sprite.scale.x = distanceScale * otherfield.starBaseSize;
        sprite.scale.y = distanceScale * otherfield.starBaseSize + distanceScale * otherfield.speed * otherfield.starStretch * distanceCenter / this.width;
        sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
      }
    }

    this.canvas.render();
    this.objects3d.texture.needsUpdate = true;
  }

  /** @private */
  animate() {
    const tween = this.tween;
    const { crystal } = this.objects2d.scene;

    crystal.scale.set(1, 1);
    tween.to(crystal.scale, { x: 0.25, y: 0.25, duration: 6, ease: 'sine.inOut'});
    tween.to(crystal, { alpha: 1, duration: 3, ease: 'sine.inOut'});
    tween.to(this.objects2d.starfield, { delta: 10, duration: 6, ease: 'sine.out', delay: 3});

    tween.delayed(4, () => {
      this.spawnObject();
      this.triggerOtherSpawn = true;
    });
  }

  warpBoostSimple() {
    const tween = this.tween;
    const { stars, tiltShift, crystal } = this.objects2d.scene;
    const angle = Random.float.minmax(-45, 45);

    tween.fromTo(this.objects2d,
      { warpSpeed: 2 },
      { warpSpeed: 0, duration: 3, ease: 'sine.out', onUpdate: () => {
          tiltShift.blur = this.objects2d.warpSpeed * (15.6 * 0.25);
        }},
    );
    tween.to(crystal.scale, { x: 0.1, y: 0.1, duration: 1, ease: 'power.in'});
    tween.to(crystal.scale, { x: 0.25, y: 0.25, duration: 2, delay: 1, ease: 'power.inOut'});
    tween.to(stars, { angle: `+=${angle}`, duration: 1, ease: 'power1.out'});
  }

  warpBoostExtendedSetup() {
    const tween = this.tween;
    const { stars, others, crystal } = this.objects2d.scene;
    tween.to(stars, { angle: "+360", duration: 10, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    tween.to(others, { angle: "+360", duration: 10, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    tween.to(crystal, { angle: "-360", duration: 10, delay: 1, repeat: -1, yoyo: true, ease: 'power1.inOut'});
    tween.to(crystal.scale, { x: 0.1, y: 0.1, duration: 5, repeat: -1, yoyo: true, ease: 'power1.inOut'});
  }

  warpBoostExtended(factor = 1) {
    const { tiltShift } = this.objects2d.scene;
    this.tween.fromTo(this.objects2d,
      { warpSpeed: 2 * factor },
      { warpSpeed: 0, duration: 3.5, ease: 'sine.out', onUpdate: () => {
          tiltShift.blur = this.objects2d.warpSpeed * (15.6 * 0.25);
        }},
    );
  }

  fadeToWhite() {
    const tween = this.tween;
    const { flash } = this.objects2d.scene;
    tween.to(flash, { alpha: 1, duration: 1, ease: 'sine.inOut'});
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  handleParameterChange(value) {
    switch(value) {
      case 0: {
        this.warpBoostSimple();
        break;
      }
      case 1: {
        this.warpBoostSimple();
        break;
      }
      case 2: {
        this.warpBoostExtendedSetup();
        this.warpBoostExtended();
        break;
      }
      case 3: {
        this.warpBoostExtended();
        break;
      }
      case 4: {
        this.warpBoostExtended(1.5);
        break;
      }
      case 5: {
        this.warpBoostExtended(2);
        break;
      }
      case 6: {
        this.warpBoostExtended(3);
        break;
      }
      case 7: {
        this.warpBoostExtended(4);
        this.fadeToWhite();
        break;
      }
      default: {
        console.log('unmapped parameter:', value);
      }
    }
  }
}
