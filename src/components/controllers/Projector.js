/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { EffectComposer, RenderPass, SavePass } from 'postprocessing';
import DomEvents from '@/objects/DomEvents.js';

//----------------------------------
// Type Definitions
//----------------------------------
/**
 * @typedef  {Object} RenderObject
 * @property {String} name
 * @property {THREE.Scene} scene
 * @property {THREE.Camera} camera
 * @property {PostProcessingObject} post
 */

/**
 * @typedef  {Object} PostProcessingObject
 * @property {RenderPass} renderPass
 * @property {SavePass} savePass
 * @property {EffectPass} effectPass
 */

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
let statsEnabled = false;
let stats = null;
let sraf = null;

let renderer = null;
let composer = null;
let rraf = null;

let globals = {};
let evtHandlers = {};
let renderTargets = [];

/**
 * Static Stage Class
 */
export default class Projector {
  //---------------------------------------------------
  //
  //  Initialization
  //
  //---------------------------------------------------
  static initialize(container, showStats = false) {
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, wWidth / wHeight, 1, 1000);
    camera.position.set(0, 0, 200);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      precision: 'highp',
      powerPreference: 'high-performance',
      antialias: true,
      stencil: false,
      depth: true,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(wWidth, wHeight);
    container.insertAdjacentElement('afterbegin', renderer.domElement);

    composer = new EffectComposer(renderer);

    const scene = new THREE.Scene();
    renderTargets.push({
      name: 'main',
      scene,
      camera,
      post: {
        renderPass: new RenderPass(scene, camera),
        savePass: null,
        effectPass: null,
      },
    });

    statsEnabled = showStats;
    if (statsEnabled) {
      stats = new Stats();
      container.appendChild(stats.dom);
      const updateStats = () => {
        stats.update();
        sraf = requestAnimationFrame(updateStats);
      };
      updateStats();
    }

    evtHandlers.handleWindowResize = this.handleWindowResize.bind(this);
    window.addEventListener(DomEvents.RESIZE, evtHandlers.handleWindowResize);

    this.render();
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  static get globals() {
    return globals;
  }

  static set outputEncoding(value) {
    renderer.outputEncoding = value || 3001;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------

  //----------------------------------
  // Render Object Methods
  //----------------------------------
  /**
   * Create a new RenderObject
   * @param name {String}
   * @param width {Number}
   * @param height {Number}
   * @returns {RenderObject}
   */
  static createRenderObject(name, width, height) {
    const wWidth = width * 20;
    const wHeight = height * 20;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, wWidth / wHeight, 1, 1000);
    const post = {
      renderPass: new RenderPass(scene, camera),
      savePass: new SavePass(),
      effectPass: null,
    };

    camera.position.set(0, 0, 200);
    camera.lookAt(0, 0, 0);

    const obj = { name, scene, camera, post };
    renderTargets.unshift(obj);
    return obj;
  }

  /**
   * Returns a RenderObject by name
   * @param {String} name
   * @returns {{RenderObject}|null}
   */
  static getRenderObject(name) {
    return renderTargets.find(obj => obj.name === name) || null;
  }

  /**
   * Returns a THREE.Scene from a RenderObject by name
   * @param {String} name
   * @returns {THREE.Scene|null}
   */
  static getRenderScene(name) {
    const rtobj = renderTargets.find(obj => obj.name === name) || null;
    return (rtobj) ? rtobj.scene || null : null;
  }

  /**
   * Return a THREE.Camera from a RenderObject by name
   * @param {String} name
   * @returns {THREE.Camera|null}
   */
  static getRenderCamera(name) {
    const rtobj = renderTargets.find(obj => obj.name === name) || null;
    return (rtobj) ? rtobj.camera || null : null;
  }

  /**
   * Returns a PostProcessingObject from a RenderObject by name
   * @param {String} name
   * @returns {PostProcessingObject|null}
   */
  static getRenderPostProccessing(name) {
    const rtobj = renderTargets.find(obj => obj.name === name) || null;
    return (rtobj) ? rtobj.post || null : null;
  }

  //----------------------------------
  // Cleanup / Destruction
  //----------------------------------
  static destroy() {
    window.removeEventListener(DomEvents.RESIZE, evtHandlers.handleWindowResize);

    if (statsEnabled) {
      cancelAnimationFrame(sraf);
      stats.dom.parentNode.removeChild(stats.dom);
      stats = null;
      sraf = null;
    }

    cancelAnimationFrame(rraf);
    rraf = null;

    renderTargets.forEach((obj) => {
      obj.scene.clear();
    });

    renderTargets = [];
    evtHandlers = {};
    globals = {};

    // scene.clear();
    renderer.domElement.parentNode.removeChild(renderer.domElement);
    renderer.forceContextLoss();
    renderer.domElement = null;
    renderer = null;
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  /** @private */
  static render() {
    const run = () => {
      if (rraf !== null) {
        rraf = requestAnimationFrame(run);
      }
      composer.removeAllPasses();
      renderTargets.forEach((obj) => {
        if (obj.post?.renderPass) {
          composer.addPass(obj.post.renderPass);
        }
        if (obj.post?.effectPass) {
          composer.addPass(obj.post.effectPass);
        }
        if (obj.post?.savePass) {
          composer.addPass(obj.post.savePass);
        }
      });
      composer.render();
    };
    rraf = requestAnimationFrame(run);
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------

  /** @private */
  static handleWindowResize() {
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;
    const camera = this.getRenderCamera('main');
    if (camera) {
      camera.aspect = wWidth / wHeight;
      camera.updateProjectionMatrix();
    }
    if (renderer) {
      renderer.setSize(wWidth, wHeight);
    }
  }
}
