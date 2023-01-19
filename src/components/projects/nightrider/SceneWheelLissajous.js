/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import AudioController from '@/components/controllers/audio/AudioController.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Lissajous Curve Analyzer on the Wheel Knob
 */
export default class SceneWheelLissajous extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    this.canvas = null;
    this.context = null;
    this.graphic = null;
    this.texture = null;
    this.material = null;
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
    tracker.jogWheel.visible = true;
    tracker.jogWheel.border.visible = false;
    tracker.jogWheel.fill.material = this.material;
    this.startRender(this.render);
  }

  stop() {
    this.stopRender();
    Projector.globals.tracker.resetMaterials();
  }

  async setup() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    this.canvas = canvas;
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.center.set(0.5, 0.5);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.context = canvas.getContext('2d');
    // document.documentElement.appendChild(canvas);
    // canvas.style = 'position: absolute; top: 0; border: 1px solid white';
  }

  destroy() {
    // this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
    this.context = null;
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
    AudioController.fftSize = 4096; //  / 2;
    AudioController.smoothingTimeConstant = 0.9;
    const waveformL = AudioController.getWaveformData(null, AudioController.ANALYSER.LEFT);
    const waveformR = AudioController.getWaveformData(null, AudioController.ANALYSER.RIGHT);

    const { width, height } = this.canvas;
    const context = this.context;
    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.strokeStyle = 'rgba(255,255,255, 0.05)';
    context.lineWidth = 1;
    const gain = 256;
    const len = waveformL.length;
    const lenHalf = len / 2;

    // context.moveTo(width /2, height / 2);
    for (let i = -lenHalf; i <= lenHalf; i += 1) {
      const index = i + lenHalf;
      let wL = waveformL.data[index] / 1.88;
      let wR = waveformR.data[index] / 1.88;

      /* const x = gain * Math.sin((wL / 64) * (i * 0.04) + (performance.now() * 0.00025));
      const y = gain * Math.sin((wR / 128) * (i * 0.05)); */

      const factor = 2048;
      const x = (gain * Math.sin(wL / factor * 20 * Math.PI) * (Math.sin(i) * i * 0.0512));
      const y = (gain * Math.sin(wR / factor * 20 * Math.PI) * (Math.cos(i) * i * 0.0512));

      // const factor = performance.now() * 0.0003;
      // const x = gain * Math.sin(wL * factor + (i * 0.00002));
      // const y = gain * Math.sin(wR * factor);

      // const x = gain * (256 * (wL / 256) - (256 / 2)) * 0.0512;
      // const y = gain * (256 * (wR / 256) - (256 / 2)) * 0.0512;

      // const x = (gain * Math.sin((wL) * Math.sin(i * 0.0003) + (performance.now() * 0.00256))) * 0.65
      // const y = (gain * Math.sin((wR) * Math.sin(i * 0.00018))) * 0.65;

      context.lineTo(x + (width / 2), y + (height / 2));
    }
    context.stroke();
    context.strokeStyle = 'rgba(255,255,255, 0.05)';
    context.lineWidth = 2;
    context.stroke();
    context.strokeStyle = 'rgba(255,255,255, 0.05)';
    context.lineWidth = 4;
    context.stroke();

    this.texture.rotation -= 0.005;
    this.texture.needsUpdate = true;
  }
}
