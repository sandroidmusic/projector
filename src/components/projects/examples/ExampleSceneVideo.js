/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import ThreeMaterial from '@/components/helpers/ThreeMaterial.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
let material;
let video;

/**
 * Example Scene - How to use video
 */
export default class ExampleSceneVideo extends AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------

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
    video.currentTime = 0;
    video.play();
    Projector.globals.tracker.body.fill.material = material;
  }

  stop() {
    Projector.globals.tracker.resetMaterials();
    video.pause();
  }

  async setup() {
    const data = await ThreeMaterial.load.video('/assets/examples/test-video.mp4');
    material = data.material;
    video = data.video;
  }

  destroy() {
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Render / Animation Methods
  //
  //---------------------------------------------------
}
