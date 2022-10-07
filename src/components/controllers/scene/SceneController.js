/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------

//----------------------------------
// Type Definitions
//----------------------------------

/**
 * @typedef {Object} SceneDefinition
 * @property {Number|String} id
 * @property {AbstractScene[]} scenes
 */

/**
 * @typedef {Object} InstancedScene
 * @property {Number|String} id
 * @property {AbstractScene[]} instances
 */

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
import MidiController from '@/components/controllers/midi/MidiController.js';
import MidiEvent from '@/components/controllers/midi/objects/MidiEvent.js';

/** @type {InstancedScene[]} */
let instancedScenes = [];
/** @type InstancedScene|null */
let activeScene = null;
let midiChannel = 16;

/**
 * Static Stage Class
 */
export default class SceneController {
  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  static get activeScene() {
    return activeScene;
  }

  static set midiChannel(value) {
    midiChannel = value;
  }

  static get midiChannel() {
    return midiChannel;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  /**
   * Setup Scenes
   * @param {SceneDefinition[]} scenes    Array of SceneDefinitions
   */
  static async setup(scenes = []) {
    instancedScenes = [];
    for (let sidx = 0, numScenes = scenes.length; sidx < numScenes; sidx += 1) {
      /** @type SceneDefinition */
      const preset = scenes[sidx];
      const id = preset.id;
      /** @type AbstractScene[] */
      const sceneRefs = preset.scenes || [];
      const instances = [];
      for (let ridx = 0, numRefs = sceneRefs.length; ridx < numRefs; ridx += 1) {
        const SceneClass = sceneRefs[ridx];
        // noinspection JSValidateTypes
        const instance = new SceneClass();
        // eslint-disable-next-line no-await-in-loop
        await instance.setup();
        instances.push(instance);
      }
      /** @type InstancedScene */
      const instanced = { id, instances };
      instancedScenes.push(instanced);
    }

    MidiController.on(MidiEvent.SCENE_PARAM, (evt) => {
      if (activeScene && evt.channel === midiChannel) {
        activeScene.instances.forEach((i) => {
          // eslint-disable-next-line no-param-reassign
          i.parameter = evt.value;
        });
      }
    });

    MidiController.on(MidiEvent.SCENE_CHANGE, (evt) => {
      if (evt.channel === midiChannel) {
        this.play(evt.value);
      }
    });
  }

  /**
   * Play a Scene
   * @param {Number|String} id    The id of the scene to play
   */
  static play(id) {
    const scene = instancedScenes.find(s => s.id === id);
    if (activeScene && scene && scene.id !== activeScene.id) {
      this.stop();
    }
    if (scene && (!activeScene || activeScene.id !== scene.id)) {
      activeScene = scene;
      scene.instances.forEach((i) => {
        i.play();
      });
    }
    return this;
  }

  /**
   * Stops a scene
   * @param {Number|String} [id]    The id of the scene to play. If no id is passed the currently active scene is stopped
   */
  static stop(id = null) {
    const scene = id ? instancedScenes.find(s => s.id === id) : activeScene;
    if (scene) {
      scene.instances.forEach((i) => {
        i.stop();
      });
    }
    return this;
  }

  /**
   * Set scene parameter
   * @param {Number} value
   */
  static setSceneParameter(value) {
    if (activeScene) {
      activeScene.instances.forEach((i) => {
        // eslint-disable-next-line no-param-reassign
        i.parameter = value;
      });
    }
    return this;
  }

  /**
   * Destroys all scenes and resets the controller
   */
  static destroy() {
    instancedScenes.forEach((scene) => {
      scene.instances.forEach((i) => {
        i.stop();
        i.destroy();
      });
    });
    activeScene = null;
    instancedScenes = [];
  }
}
