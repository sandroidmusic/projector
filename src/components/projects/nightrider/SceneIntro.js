/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { GlitchFilter } from 'pixi-filters';
import { BlendFunction, BloomEffect, EffectPass } from 'postprocessing';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeCreate from '@/components/helpers/ThreeCreate.js';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';
import Tween from '@/components/helpers/Tween.js';
import Random from '@/utils/Random.js';

//----------------------------------
// Constants
//----------------------------------
const COLOR = 0xffb000;
const LINE_SIZE = 1;

/**
 * Intro Scene
 */
export default class SceneIntro extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    const tracker = Projector.globals.tracker;
    this.width = tracker.width;
    this.height = tracker.height;
    this.tween = new Tween();
    this.canvas = null;
    this.assets = null;
    this.objects2d = {
      container: null,
      outline: null,
      logo: null,
      title: null,
      copy: null,
      lines: null,
      button: null,
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
    this.animateIntro();
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
    const { scene: renderScene, camera, post } = Projector.createRenderObject('intro-canvas', sceneWidth, sceneHeight);

    // Add BloomEffect to a new EffectPass for the render object
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.7,
      intensity: 2.0,
    });
    post.effectPass = new EffectPass(camera, bloomEffect);

    // Create a new 2d scene
    const ccObjects = await PixiCanvas.create(sceneWidth * 2, sceneHeight * 2, {
      logo: '/assets/nightrider/sandroid.png',
      nightrider: '/assets/nightrider/nightrider.png',
    });

    // let's add one container where we add all objects
    const container = new PIXI.Container();
    container.position.set(sceneWidth / 2, sceneHeight / 2);
    ccObjects.canvas.stage.addChild(container);

    this.canvas = ccObjects.canvas;
    this.assets = ccObjects.assets;
    this.objects2d.container = container;
    this.objects3d.texture = ccObjects.texture;

    // Let's add a Plane to the main scene
    const plane = ThreeCreate.plane({
      size: { x: sceneWidth * 2, y: sceneHeight * 2, z: 0 },
      position: { x: 0, y: 0, z: 0 },
    });
    plane.visible = false;
    plane.material = new THREE.MeshBasicMaterial({ map: post.savePass.renderTarget.texture });
    mainScene.add(plane);
    this.objects3d.plane = plane;

    // now let's create another plane in it, where the 2d content is rendered
    const renderPlane = ThreeCreate.plane({
      position: { x: 0, y: 0, z: -24 },
      size: { x: sceneWidth, y: sceneHeight, z: 0 },
      color: 0x000000,
    });
    renderScene.add(renderPlane);
    renderPlane.material = new THREE.MeshBasicMaterial({ map: ccObjects.texture });

    // time to create the 2d content
    this.objects2d.outline = this.createOutline();
    this.objects2d.logo = this.createLogo();
    this.objects2d.title = this.createTitle();
    this.objects2d.copy = this.createText();
    this.objects2d.lines = this.createLines();
    this.objects2d.button = this.createButton();
  }

  destroy() {
    PixiCanvas.destroy(this.canvas);
    this.tween = null;
    this.canvas = null;
    this.assets = null;
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
   * @returns {{top: PIXI.Container, left: PIXI.Container, bottom: PIXI.Container, right: PIXI.Container}}
   */
  createOutline() {
    const sceneWidth = this.width;
    const sceneHeight = this.height;
    const container = this.objects2d.container;

    const top = new PIXI.Container();
    const right = new PIXI.Container();
    const bottom = new PIXI.Container();
    const left = new PIXI.Container();

    top.position.set(0, 0);
    right.position.set(sceneWidth, 0);
    bottom.position.set(sceneWidth, sceneHeight);
    left.position.set(0, sceneHeight);

    container.addChild(top);
    container.addChild(right);
    container.addChild(bottom);
    container.addChild(left);

    const t = new PIXI.Graphics();
    t.lineStyle(LINE_SIZE, COLOR, 1);
    t.moveTo(0, 0);
    t.lineTo(sceneWidth, 0);
    top.addChild(t);


    const r = new PIXI.Graphics();
    r.lineStyle(LINE_SIZE, COLOR, 1);
    r.moveTo(0, 0);
    r.lineTo(0, sceneHeight);
    right.addChild(r);

    const b = new PIXI.Graphics();
    b.lineStyle(LINE_SIZE, COLOR, 1);
    b.moveTo(0, 0);
    b.lineTo(-sceneWidth, 0);
    bottom.addChild(b);


    const l = new PIXI.Graphics();
    l.lineStyle(LINE_SIZE, COLOR, 1);
    l.moveTo(0, 0);
    l.lineTo(0, -sceneHeight);
    left.addChild(l);

    top.scale.x = 0;
    right.scale.y = 0;
    bottom.scale.x = 0;
    left.scale.y = 0;

    return { top, right, bottom, left };
  }

  /**
   * @private
   * @returns {{container: PIXI.Container, blocks: *[]}}
   */
  createLogo() {
    const sceneWidth = this.width;
    const sceneHeight = this.height;
    const container = new PIXI.Container();
    const sprite = PIXI.Sprite.from(this.assets.logo);

    sprite.scale.set(0.2, 0.2);
    container.addChild(sprite);
    container.position.set((sceneWidth - sprite.width) / 2, (sceneHeight - sprite.height) / 2);
    this.objects2d.container.addChild(container);

    const blockX = container.width / 87;
    const blockY = container.height / 12;
    const blocks = [];
    for (let y = 0; y < 12; y += 1) {
      const arr = [];
      for (let x = 0; x < 87; x += 1) {
        const g = new PIXI.Graphics();
        g.beginFill(0x000000);
        g.alpha = 1;
        g.drawRect(x * blockX, y * blockY, blockX, blockY);
        g.endFill();
        container.addChild(g);
        arr.push(g);
      }
      blocks.push(arr);
    }
    return { container, blocks };
  }

  /**
   * @private
   * @returns {{container: PIXI.Container, blocks: *[]}}
   */
  createTitle() {
    const sceneWidth = this.width;
    const sceneHeight = this.height;
    const container = new PIXI.Container();
    const sprite = PIXI.Sprite.from(this.assets.nightrider);

    sprite.scale.set(0.2, 0.2);
    container.addChild(sprite);
    container.position.set((sceneWidth - sprite.width) / 2, (sceneHeight - sprite.height) / 2);
    this.objects2d.container.addChild(container);
    container.alpha = 0;

    const blockX = container.width / 87;
    const blockY = container.height / 12;
    const blocks = [];
    for (let y = 0; y < 12; y += 1) {
      const arr = [];
      for (let x = 0; x < 87; x += 1) {
        const g = new PIXI.Graphics();
        g.beginFill(0x000000);
        g.alpha = 1;
        g.drawRect(x * blockX, y * blockY, blockX, blockY);
        g.endFill();
        container.addChild(g);
        arr.push(g);
      }
      blocks.push(arr);
    }
    return { container, blocks };
  }

  /**
   * @private
   * @returns {PIXI.Text}
   */
  createText() {
    const sceneWidth = this.width;
    const sceneHeight = this.height;
    const style = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 9,
      fill: COLOR,
    });
    const text = new PIXI.Text('PRESENTS', style);
    text.x = (sceneWidth - text.width) / 2;
    text.y = sceneHeight - 72.5;
    text.alpha = 0;
    this.objects2d.container.addChild(text);
    return text;
  }

  /**
   * @private
   * @returns {PIXI.Graphics[]}
   */
  createLines() {
    const sceneWidth = this.width;
    const sceneHeight = this.height;
    const container = this.objects2d.container;
    const numLines = 20;
    const distanceX = sceneWidth / numLines;
    const distanceY = sceneHeight / numLines;
    const lines = [];

    for (let i = 1; i < numLines; i += 1) {
      const x = new PIXI.Graphics();
      x.lineStyle(1, COLOR, 1, 0.4, true);
      x.moveTo(i * distanceX, 0);
      x.lineTo(sceneWidth, i * distanceY);
      x.alpha = 0;
      container.addChild(x);
      lines.push(x);

      const y = new PIXI.Graphics();
      y.lineStyle(1, COLOR, 1, 0.4, true);
      y.moveTo(i * distanceX, sceneHeight);
      y.lineTo(0, i * distanceY);
      y.alpha = 0;
      container.addChild(y);
      lines.push(y);
    }
    return lines;
  }

  /**
   * @private
   * @returns {PIXI.Graphics[]}
   */
  createButton() {
    const container = this.objects2d.container;

    const x = 180;
    const y = 99;
    const size = 15;

    const rects = [];

    for (let i = 0; i < 30; i += 1) {
      if (i % 6 !== 0) {
        const rect = new PIXI.Graphics();
        rect.lineStyle(1, COLOR, 1, 0.4);
        rect.drawRoundedRect(x - (i / 2), y - (i / 2), size + i, size + i, 2 * (i / 4));
        rect.alpha = 0;
        container.addChild(rect);
        rects.push(rect);
      }
    }
    return rects.reverse();
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
  animateIntro() {
    const tween = this.tween;
    const sceneWidth = this.width;
    const { outline, logo, title, copy } = this.objects2d;

    tween.to(outline.top.scale, { x: 1, duration: 1, delay: 1 });
    tween.to(outline.right.scale, { y: 1, duration: 1, delay: 2 });
    tween.to(outline.bottom.scale, { x: 1, duration: 1, delay: 1 });
    tween.to(outline.left.scale, { y: 1, duration: 1, delay: 2 });
    tween.to(outline.top, { alpha: 0.3, duration: 2, yoyo: true, repeat: -1, delay: 3 });
    tween.to(outline.right, { alpha: 0.3, duration: 2, yoyo: true, repeat: -1, delay: 3.2 });
    tween.to(outline.bottom, { alpha: 0.3, duration: 2, yoyo: true, repeat: -1, delay: 3.4 });
    tween.to(outline.left, { alpha: 0.3, duration: 2, yoyo: true, repeat: -1, delay: 3.6 });

    logo.blocks.forEach((block, i) => {
      block.forEach((g, index) => {
        tween.to(g, { alpha: 0, duration: 0, delay: 3 + (i * 0.1) + (index / 800) });
      });
    });

    tween.to(copy, { alpha: 1, duration: 1, delay: 4.25 });
    tween.to(copy, { alpha: 0, duration: 1, delay: 6 });

    logo.blocks.forEach((block, i) => {
      block.forEach((g, index) => {
        tween.to(g, { alpha: 1, duration: 0, delay: 6.5 + (i * 0.1) + (index / 800) });
      });
    });

    tween.delayed(7.5, () => {
      title.container.alpha = 1;
      title.blocks.forEach((block, i) => {
        block.forEach((g, index) => {
          tween.to(g, { alpha: 0, duration: 0, delay: (i * 0.1) + (index / 800) });
        });
      });
    });

    const filter = new GlitchFilter({
      offset: 10,
      average: false,
      red: [7, 0],
      green: [9, 0],
      blue: [0, 0],
    });
    filter.blendMode = PIXI.BLEND_MODES.DIFFERENCE;

    let timeout = 0;
    const glitchRandomizer = () => {
      clearTimeout(this.timeoutId);
      const decision = Math.random() > 0.5;
      if (decision) {
        filter.seed = Math.random();
        filter.shuffle();
        filter.refresh();
        filter.redraw();
        title.container.filters = [filter];
        timeout = Random.int.minmax(50, 150);
      } else {
        title.container.filters = [];
        timeout = Random.int.minmax(500, 1500);
      }
      this.timeoutId = setTimeout(glitchRandomizer, timeout);
    };
    glitchRandomizer();

    tween.delayed(13, () => {
      title.blocks.forEach((block, i) => {
        block.forEach((g, index) => {
          tween.to(g, { alpha: 1, duration: 0, delay: (i * 0.1) + (index / 800) });
        });
      });
    });

    const tracker = Projector.globals.tracker;
    tracker.resetBorderMaterials(COLOR);
    tween.delayed(14, () => {
      tracker.position.x -= 5;
      tracker.visible = true;
    });
    tween.delayed(14.1, () => {
      tracker.visible = false;
    });
    tween.delayed(14.15, () => {
      tracker.position.x += 8;
      tracker.visible = true;
    });
    tween.delayed(14.2, () => {
      tracker.visible = false;
    });
    tween.delayed(14.25, () => {
      tracker.position.x -= 3;
      tracker.visible = true;
    });

    tween.delayed(14.25, () => {
      copy.text = 'INSERT TRACKER';
      copy.x = (sceneWidth - copy.width) / 2;
      tween.to(copy, { alpha: 1, duration: 1 });
      tween.to(copy, { alpha: 0, duration: 2, yoyo: true, repeat: -1, delay: 1 });
    });
  }

  /** @private */
  animateDeviceStart() {
    const { copy, lines, button } = this.objects2d;
    const tween = this.tween;
    tween.killTweensFor(copy);
    tween.to(copy, { alpha: 0, duration: 1 });

    Projector.globals.tracker.resetBorderMaterials(0x000000);

    lines.forEach((line, idx) => {
      tween.to(line, {
        alpha: 1,
        duration: 1,
        delay: idx * 0.025,
        yoyo: true,
        repeat: 5,
        ease: 'expo.in',
      });
    });

    tween.delayed(6.5, () => {
      button.forEach((rect, idx) => {
        tween.to(rect, {
          alpha: 1,
          duration: 0.25,
          delay: idx * 0.0235,
          yoyo: true,
          repeat: 21,
          ease: 'expo.in',
        });
      });
    });
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  handleParameterChange() {
    this.animateDeviceStart();
  }
}
