/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import { EffectPass, BlendFunction, BloomEffect } from 'postprocessing';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import AudioController from '@/components/controllers/audio/AudioController.js';
import MidiController from '@/components/controllers/midi/MidiController.js';
import MidiEvent from '@/components/controllers/midi/objects/MidiEvent.js';
import Tween from '@/components/helpers/Tween.js';
import ThreeMaterial from '@/components/helpers/ThreeMaterial.js';

//----------------------------------
// Constants
//----------------------------------
const STATIC_COLOR = 0xf78b1e;
const ANIMATED_COLOR = 0xf72871;
//----------------------------------
// Private Variables
//----------------------------------
let sceneWidth = 0;
let sceneHeight = 0;
let eventHandler;
let renderMaterial;
let rraf;

/** @type THREE.Scene */
let threeScene;
/** @TYPE LineGeometry */
let staticLineGeometry;
/** @var {Tween} */
let tween;

/**
 * Synthwave-like Audio Analyzer Example
 */
export default class ExampleSceneAnalyzer extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    super();
    const { width, height } = Projector.globals.tracker;
    sceneWidth = width;
    sceneHeight = height;
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
    tracker.body.border.visible = false;
    tracker.padsGrid.visible = false;
    tracker.navigationKeys.borderVisible = false;
    tracker.screenKeys.borderVisible = false;
    tracker.jogWheel.visible = true;
    tracker.jogWheel.border.visible = false;
    this.createChildren();
    eventHandler = this.animate.bind(this);
    MidiController.on(MidiEvent.BEAT, eventHandler);
    this.render();
  }

  stop() {
    MidiController.off(MidiEvent.BEAT, eventHandler);
    tween.killAll();
    cancelAnimationFrame(rraf);
    rraf = null;
    threeScene.clear();
  }

  async setup() {
    const { scene, camera, post } = Projector.createRenderObject('synthwave-analyzer', sceneWidth, sceneHeight);
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.7,
      intensity: 2.0,
    });
    post.effectPass = new EffectPass(camera, bloomEffect);
    renderMaterial = new THREE.MeshBasicMaterial({ map: post.savePass.renderTarget.texture });
    threeScene = scene;

    tween = new Tween();
  }

  destroy() {
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  /** @private */
  createChildren() {
    const staticMaterial = new LineMaterial({
      color: STATIC_COLOR,
      opacity: 1,
      linewidth: 0.001, // in world units with size attenuation, pixels otherwise
      vertexColors: false,
      dashed: false,
      alphaToCoverage: true,
    });

    staticLineGeometry = new LineGeometry();
    const staticLine = new Line2(staticLineGeometry, staticMaterial);
    staticLine.position.y = -((sceneHeight / 2));
    threeScene.add(staticLine);

    const animationDuration = 6;
    const numBeats = Math.ceil(MidiController.tempo * (animationDuration / 60));
    for (let i = 0; i < numBeats; i += 1) {
      const { points, colors } = this.getFrequencyPointsAndColors();
      const geometry = new LineGeometry();
      geometry.setPositions(points);
      geometry.setColors(colors);

      const material = new LineMaterial({
        color: ANIMATED_COLOR,
        opacity: 1,
        linewidth: 0.003, // in world units with size attenuation, pixels otherwise
        vertexColors: false,
        dashed: false,
        alphaToCoverage: true,
      });

      const line = new Line2(geometry, material);
      line.position.y = -((sceneHeight / 2));
      threeScene.add(line);

      const ptween = tween.to(line.position, {
        y: ((sceneHeight / 2) - 64),
        z: -512,
        duration: animationDuration,
        ease: 'linear',
        // eslint-disable-next-line no-loop-func
        onComplete: () => {
          threeScene.remove(line);
          line.clear();
        },
      });
      const mtween = tween.to(material, {
        linewidth: 0,
        duration: 6,
        ease: 'linear',
      });

      ptween.pause();
      mtween.pause();
      ptween.time((i + 1) * MidiController.beatLength);
      mtween.time((i + 1) * MidiController.beatLength);
      ptween.play();
      mtween.play();
    }
    Projector.globals.tracker.body.fill.material = renderMaterial;
  }

  /** @private */
  getFrequencyPointsAndColors() {
    AudioController.gain = 4;
    AudioController.fftSize = 128;
    const frequencies = AudioController.getFrequencyData();
    const shaveOff = 32;
    const stepWidth = ((sceneWidth / 2) / (frequencies.length - shaveOff));
    const points = [];
    const colors = [];
    const color = new THREE.Color(0x000000);
    let x = -Math.floor((sceneWidth / 2)) + 3;

    let reverseFrequencies = [];
    for (let i = 0; i < frequencies.length - shaveOff; i += 1) {
      const height = frequencies.data[i];
      reverseFrequencies.push(height);
      points.push(x, height / 2.5, 0);
      colors.push(color.r, color.g, color.b);
      x += stepWidth;
    }

    reverseFrequencies = reverseFrequencies.reverse();
    for (let i = 0; i < reverseFrequencies.length; i += 1) {
      const height = reverseFrequencies[i];
      points.push(x, height / 2.5, 0);
      colors.push(color.r, color.g, color.b);
      x += stepWidth;
    }
    return { points, colors };
  }

  //---------------------------------------------------
  //
  //  Render / Animation Methods
  //
  //---------------------------------------------------
  /** @private */
  render() {
    const run = () => {
      if (rraf !== null) {
        rraf = requestAnimationFrame(run);
      }
      const { points, colors } = this.getFrequencyPointsAndColors();
      staticLineGeometry.setPositions(points);
      staticLineGeometry.setColors(colors);
    };
    rraf = requestAnimationFrame(run);
  }

  /** @private */
  animate() {
    try {
      const { points, colors } = this.getFrequencyPointsAndColors();
      const geometry = new LineGeometry();
      geometry.setPositions(points);
      geometry.setColors(colors);

      const material = new LineMaterial({
        color: ANIMATED_COLOR,
        opacity: 1,
        linewidth: 0.003, // in world units with size attenuation, pixels otherwise
        vertexColors: false,
        dashed: false,
        alphaToCoverage: true,
      });

      const line = new Line2(geometry, material);
      line.position.y = -((sceneHeight / 2));
      threeScene.add(line);

      tween.to(line.position, {
        y: ((sceneHeight / 2) - 64),
        z: -512,
        duration: 6,
        ease: 'linear',
        onComplete: () => {
          threeScene.remove(line);
          line.clear();
        },
      });
      tween.to(material, {
        linewidth: 0,
        duration: 6,
        ease: 'linear',
      });
    } catch (err) {
      // ignore
    }
  }
}
