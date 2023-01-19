/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';
import Tween from '@/components/helpers/Tween.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Write Text on the Pads
 */
export default class ScenePadsText extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.matrixText = null;
    this.tween = new Tween();
    this.canvas = null;
    this.padMaterials = null;
    this.padTextures = null;
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
    tracker.padsGrid.borderColor = 0x000000;
    tracker.padsGrid.fills.forEach((fill, index) => {
      // eslint-disable-next-line no-param-reassign
      fill.material = this.padMaterials[index];
    });
    this.startRender(this.render);
  }

  stop() {
    this.tween.killAll();
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
        texture.minFilter = THREE.NearestFilter;
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(size / width, size / height);
        texture.offset.x = ((1 / gridX) / 2) + (x / gridX);
        texture.offset.y = ((1 / gridY) / 2) + (y / gridY);
        materials.push(new THREE.MeshBasicMaterial({ map: texture }));
        textures.push(texture);
      }
    }
    this.padMaterials = materials;
    this.padTextures = textures;

    const style = new PIXI.TextStyle({
      fontFamily: 'Pixel 4x4',
      fontSize: 189,
      fill: 0xffb000,
    });
    const matrixText = new PIXI.Text('', style);
    matrixText.x = -1.2;
    matrixText.y = -43;
    matrixText.alpha = 1;
    matrixText.scale.x = 1.005;
    matrixText.scale.y = 1;
    matrixText.alpha = 0.1;
    canvas.stage.addChild(matrixText);
    this.matrixText = matrixText;

    /*
    const numSteps = matrixText.width / 32;
    for (let i = 0, n = numSteps; i <= n; i += 1) {
      this.tween.delayed(i * 0.125, () => {
        matrixText.x -= 31.905;
      });
    }
    */
    /*
    const duration = numChars / 2;
    matrixText.text = str;
    this.tween.to(matrixText, {
      x: -matrixText.width,
      duration,
      ease: 'none',
    });
    */
  }

  destroy() {
    PixiCanvas.destroy(this.canvas);
    this.canvas = null;
    this.padMaterials = null;
    this.padTextures = null;
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  scrollText(text, speed = 0.1) {
    const matrixText = this.matrixText;
    matrixText.x = -1.2;
    matrixText.text = '            ' + text;
    const numSteps = matrixText.width / 32;
    for (let i = 0, n = numSteps; i <= n; i += 1) {
      this.tween.delayed(i * speed, () => {
        matrixText.x -= 31.905;
      });
    }
  }
  showText(text) {
    const matrixText = this.matrixText;
    matrixText.x = -1.2;
    matrixText.text = text;
  }
  //---------------------------------------------------
  //
  //  Animation / Render Handlers
  //
  //---------------------------------------------------
  render() {
    const textures = this.padTextures;
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
    if (value === 20) {
      this.animateText('1234567890', 0.075);
    } else if (value === 21) {
      this.animateText('REMEMBER HIS NAME', 0.075);
    }
  }
}
