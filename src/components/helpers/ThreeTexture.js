/* eslint-disable */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

/**
 * Static Texture Creation Helper
 */
export default class ThreeTexture {
  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  static get load() {
    return {
      /**
       * Loads texture from image
       * @param url {String}
       * @returns {Promise<THREE.CanvasTexture>}
       */
      image: url => new Promise((resolve, reject) => {
        const image = new Image();
        image.id = `image-${uuidv4()}`;
        image.crossOrigin = 'anonymous';
        image.onload = async () => {
          const texture = new THREE.CanvasTexture(image);
          texture.center.set(0.5, 0.5);
          resolve(texture);
        };
        image.onerror = () => { reject(new Error('URL could not be loaded.')); };
        image.src = url;
      }),
      /**
       * Loads a video
       * @param url {String}
       * @param url
       * @returns {Promise<{texture:THREE.VideoTexture, video:HTMLVideoElement}>}
       */
      video: url => new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        video.id = `video-${uuidv4()}`;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.preload = 'auto';
        video.muted = true;
        video.oncanplaythrough = async () => {
          video.onseeked = null;
          video.oncanplaythrough = null;
          const texture = new THREE.VideoTexture(video);
          texture.center.set(0.5, 0.5);
          texture.format = THREE.RGBAFormat;
          video.currentTime = 0;
          resolve({ texture, video });
        };
        video.onerror = () => { reject(new Error('File could not be loaded.')); };

        const res = await fetch(url);
        const blob = await res.blob();
        video.src = URL.createObjectURL(blob);
      }),
    };
  }
}
