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
 * Amiga Protracker Hommage
 */
export default class SceneBarVisualizer extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.canvas = null;
    this.bodyMaterial = null;
    this.buttonMaterial = null;
    this.padMaterials = null;
    this.padTextures = null;
    this.sprites = null;
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
    tracker.padsGrid.visible = true;
    tracker.padsGrid.borderColor = 0x000000;
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

    const { canvas, assets, texture: canvasTexture } = await PixiCanvas.create(width, height, {
      ptWhiteGradient: '/assets/nightrider/gradient-synthwave.png',
    });
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

    const sprites = [];
    for (let i = 0; i < gridX; i += 1) {
      const sprite = PIXI.Sprite.from(assets.ptWhiteGradient);
      canvas.stage.addChild(sprite);
      sprite.width = 32;
      sprite.height = height;
      sprite.anchor.y = 1;
      sprite.scale.y = 0;
      sprite.scale.x = -1;
      sprite.alpha = 1;
      sprite.y = height;
      sprite.x = i * 32;
      sprites.push(sprite);
    }
    this.sprites = sprites;
  }

  destroy() {
    PixiCanvas.destroy(this.canvas);
    this.canvas = null;
    this.padMaterials = null;
    this.padTextures = null;
    this.sprites = null;
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
    AudioController.gain = 7;
    AudioController.fftSize = 1024;
    const sprites = this.sprites;
    const textures = this.padTextures;
    const frequencies = AudioController.getFrequencyData(12);
    for (let b = 0; b < frequencies.length; b += 1) {
      sprites[b].scale.y = (frequencies.data[b] / (255 * 0.5));
    }

    this.canvas.render();
    textures.forEach((texture) => {
      // eslint-disable-next-line no-param-reassign
      texture.needsUpdate = true;
    });
  }
}
