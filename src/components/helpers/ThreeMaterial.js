/* eslint-disable no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import ThreeTexture from '@/components/helpers/ThreeTexture';

/**
 * Static Material Creation Helper
 */
export default class ThreeMaterial {
  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------

  static get WRAPMODES() {
    return {
      CLAMP_TO_EDGE: THREE.ClampToEdgeWrapping,
      REPEAT: THREE.RepeatWrapping,
      MIRRORED: THREE.MirroredRepeatWrapping,
    }
  }

  static get load() {
    return {
      /**
       * Loads an image
       * @param url {String}
       * @param transparent {Boolean}
       * @param doublesided {Boolean}
       * @returns {Promise<THREE.MeshBasicMaterial>}
       */
      image: (url, transparent = false, doublesided = false) => new Promise(async (resolve, reject) => {
        try {
          const texture = await ThreeTexture.load.image(url);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent,
            side: doublesided ? THREE.DoubleSide : THREE.FrontSide,
          });
          resolve(material);
        } catch (err) {
          reject(err);
        }
      }),
      /**
       * Loads a video
       * @param url {String}
       * @param transparent {Boolean}
       * @param doublesided {Boolean}
       * @returns {Promise<{material:THREE.MeshBasicMaterial, video:HTMLVideoElement}>}
       */
      video: (url, transparent = false, doublesided = false) => new Promise(async (resolve, reject) => {
        try {
          const { texture, video } = await ThreeTexture.load.video(url);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent,
            side: doublesided ? THREE.DoubleSide : THREE.FrontSide,
          });
          material.fog = false;
          material.reflectivity = 0;
          resolve({ material, video });
        } catch (err) {
          reject(err);
        }
      }),
    };
  }

  /**
   * @param material {THREE.Material}
   * @param mode {Number}
   */
  static wrap(material, mode) {
    material.map.wrapT = mode;
    material.map.wrapS = mode;
  }

  /**
   * @param material {THREE.Material}
   * @param x {Number}
   * @param y {Number}
   */
  static repeat(material, x = null, y = null) {
    if (x !== null) {
      material.map.repeat.x = x;
    }
    if (y !== null) {
      material.map.repeat.y = y;
    }
  }

  /**
   * @param material {THREE.Material}
   * @param x {Number}
   * @param y {Number}
   */
  static offset(material, x = null, y = null) {
    if (x !== null) {
      material.map.offset.x = x;
    }
    if (y !== null) {
      material.map.offset.y = y;
    }
  }

  /**
   * @param material {THREE.Material}
   * @param opacity {Number}
   */
  static opacity(material, opacity) {
    material.opacity = opacity;
  }
}
