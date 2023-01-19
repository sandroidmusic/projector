/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';
import AudioController from '@/components/controllers/audio/AudioController.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Stereo Oscilloscope on Pads
 */
export default class ScenePadsOscilloscope extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.canvas = null;
    this.graphic = null;
    this.padMaterials = null;
    this.padTextures = null;
    this.colorLeft = 0xFFFFFF;
    this.colorRight = 0xFFFFFF;
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
    tracker.padsGrid.visible = false;
    tracker.padsGrid.borderVisible = false;
    tracker.padsGrid.fills.forEach((fill, index) => {
      // eslint-disable-next-line no-param-reassign
      fill.material = this.padMaterials[index];
    });
    this.startRender(this.render);
  }

  stop() {
    this.stopRender();
    Projector.globals.tracker.resetMaterials();
  }

  async setup() {
    const size = 32;
    const gridX = 12;
    const gridY = 4;
    const width = gridX * size;
    const height = gridY * size;

    const { canvas, texture: canvasTexture } = await PixiCanvas.create(width, height);
    this.canvas = canvas;

    const textures = [];
    const materials = [];
    for (let y = 0; y < gridY; y += 1) {
      for (let x = 0; x < gridX; x += 1) {
        const texture = canvasTexture.clone();
        texture.repeat = new THREE.Vector2(1 / gridX, 1 / gridY);
        texture.flipY = false;
        texture.rotation = THREE.MathUtils.DEG2RAD * 180;
        texture.offset.x = ((1 / gridX) / 2) + (x / gridX);
        texture.offset.y = ((1 / gridY) / 2) + (y / gridY);
        materials.push(new THREE.MeshBasicMaterial({ map: texture }));
        textures.push(texture);
      }
    }
    this.padMaterials = materials;
    this.padTextures = textures;

    this.graphic = new PIXI.Graphics();
    canvas.stage.addChild(this.graphic);

    /*
    document.documentElement.appendChild(canvas.view);
    canvas.view.style = 'position: absolute; top: 0; border: 1px solid #333';
    */
  }

  destroy() {
    PixiCanvas.destroy(this.canvas);
    this.canvas = null;
    this.graphic = null;
    this.padMaterials = null;
    this.padTextures = null;
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
  render() {
    /** @type PIXI.Graphics */
    const g = this.graphic;
    const textures = this.padTextures;
    const { width, height } = this.canvas.view;

    g.clear();

    AudioController.fftSize = 4096;
    const waveformL = AudioController.getWaveformData(null, AudioController.ANALYSER.LEFT);
    g.lineStyle(2, this.colorLeft);

    let x = 0;
    const sliceWidthL = (width) / waveformL.length;
    for (let i = 0; i < waveformL.length; i += 1) {
      const v = waveformL.data[i] / 128.0;
      const y = (v * height / 2);
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
      x += sliceWidthL;
    }

    x = 0;
    const waveformR = AudioController.getWaveformData(null, AudioController.ANALYSER.RIGHT);
    g.lineStyle(2, this.colorRight);
    const sliceWidthR = (width) / waveformR.length;
    for (let i = 0; i < waveformR.length; i += 1) {
      const v = waveformR.data[i] / 128.0;
      const y = (v * height / 2) - 32;
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
      x += sliceWidthR;
    }

    this.canvas.render();
    textures.forEach((texture) => {
      // eslint-disable-next-line no-param-reassign
      texture.needsUpdate = true;
    });
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
    if (value === 1) {
      tracker.padsGrid.visible = true;
      AudioController.gain = 10;
      this.colorLeft = 0xff4800;
      this.colorRight = 0xffb600;
    } else if (value === 2) {
      tracker.padsGrid.visible = true;
      AudioController.gain = 5;
      this.colorLeft = 0xff4800;
      this.colorRight = 0xffb600;
    } else if (value === 3) {
      tracker.padsGrid.visible = true;
      AudioController.gain = 5;
      this.colorLeft = 0xffffff;
      this.colorRight = 0xffffff;
    }
  }
}
