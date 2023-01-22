/* eslint-disable no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { Assets } from '@pixi/assets';

//----------------------------------
// Type Definitions
//----------------------------------
/**
 * @typedef  {Object} CanvasCreateObject
 * @property {PIXI.Application} canvas
 * @property {Object} assets
 * @property {THREE.CanvasTexture} texture
 */

//----------------------------------
// Private Variables
//----------------------------------
let numCanvases = 0;
const assetProxy = new Proxy({}, {
  get(target, property) {
    return Assets.get(property);
  },
});

/**
 * Static Material Creation Helper
 */
export default class PixiCanvas {
  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  static get assets() {
    return assetProxy;
  }
  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  /**
   * Creates a new PIXI Instance and returns the instance
   * as well as a PIXI.Loader instance
   * and a THREE.CanvasTexture bound to the canvas
   * @param {Number} width
   * @param {Number} height
   * @param {Object} assets
   * @returns {CanvasCreateObject}
   */
  static create(width, height, assets = null) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // PIXI.settings.RENDER_OPTIONS.hello = false;
      PIXI.utils.skipHello();
      const canvas = new PIXI.Application({
        width,
        height,
        resolution: window.devicePixelRatio || 1,
        antialias: false,
      });
      const texture = new THREE.CanvasTexture(canvas.view);
      numCanvases += 1;

      if (assets) {
        const assetKeys = Object.keys(assets);
        assetKeys.forEach((id) => {
          Assets.add(id, assets[id]);
        });

        await Assets.load(assetKeys);
        resolve({ canvas, texture });
      } else {
        resolve({ canvas, texture });
      }
    });
  }

  static async destroy(canvas) {
    canvas.destroy(true, {children: true, texture: true, baseTexture: true});
    numCanvases -= 1;
    if (numCanvases <= 0) {
      await Assets.reset();
    }
  }
}
