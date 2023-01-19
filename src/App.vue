<script setup>
//---------------------------------------------------
//
//  Imports
//
//---------------------------------------------------
import {
  onMounted,
  onBeforeUnmount,
  ref,
} from 'vue';
import Projector from '@/components/controllers/Projector.js';
import SceneController from '@/components/controllers/scene/SceneController.js';
import AudioController from '@/components/controllers/audio/AudioController.js';
import MidiController from '@/components/controllers/midi/MidiController.js';
import MidiEvent from '@/components/controllers/midi/objects/MidiEvent.js';

import PolyendTracker from '@/components/devices/polyend/PolyendTracker.js';

/* Example Scenes */
// import ExampleSceneVideo from '@/components/projects/examples/ExampleSceneVideo.js';
// import ExampleSceneImage from '@/components/projects/examples/ExampleSceneImage.js';
// import ExampleSceneShader from '@/components/projects/examples/ExampleSceneShader.js';
// import ExampleSceneRenderTarget from '@/components/projects/examples/ExampleSceneRenderTarget.js';
// import ExampleSceneParticles from '@/components/projects/examples/ExampleSceneParticles.js';

/* Project: Night Rider */
import SceneIntro from '@/components/projects/nightrider/SceneIntro.js';
import SynthwaveAnalyzer from '@/components/projects/nightrider/SynthwaveAnalyzer.js';
import SceneProtracker from '@/components/projects/nightrider/SceneProtracker.js';
import ScenePadsOscilloscope from '@/components/projects/nightrider/ScenePadsOscilloscope.js';
import SceneAssetScope from '@/components/projects/nightrider/SceneAssetScope.js';
import SceneFireSparks from '@/components/projects/nightrider/SceneFireSparks.js';
import SceneShaderBall from '@/components/projects/nightrider/SceneShaderBall.js';
import ScenePadsOscilloscopeWhite from '@/components/projects/nightrider/ScenePadsOscilloscopeWhite.js';
import ScenePump from '@/components/projects/nightrider/ScenePump.js';
import SceneBarVisualizer from '@/components/projects/nightrider/SceneBarVisualizer.js';
import SceneBehringerTrucker from '@/components/projects/nightrider/SceneBehringerTrucker.js';
import SceneVideosBuildup from '@/components/projects/nightrider/SceneVideosBuildup.js';
import SceneVideosOutro from '@/components/projects/nightrider/SceneVideosOutro.js';

//---------------------------------------------------
//
//  Vue Data Model
//
//---------------------------------------------------
const app = ref(null);

//---------------------------------------------------
//
//  Vue Lifecycle
//
//---------------------------------------------------
onMounted(async () => { await initialize(); });
onBeforeUnmount(async () => { await destroy(); });

//---------------------------------------------------
//
//  Methods
//
//---------------------------------------------------
async function initialize() {
  // Initialize the 3d environment
  Projector.initialize(app.value, false);

  // Initialize the AudioController
  // if no audio device-id is passed, you will get a popup
  await AudioController.initialize('327681c58036bdb99660530b16fa46c75e2bf02b9ca01fb369914c87d4ca57ff');

  // Initialize the MidiController
  if (!MidiController.initialized) {
    await MidiController.initialize({
      device: 'Tracker',
      bpm: 92,
    });
  }

  // Retrieve the main 3d scene (which is always created)
  // and scale it to fit the projection on top of the device.
  const main = Projector.getRenderScene('main');
  const PROJECTION_SCALE = 0.4141;
  main.scale.set(PROJECTION_SCALE, PROJECTION_SCALE, 1);

  // Create an instance of the PolyendTracker object
  const tracker = new PolyendTracker(0x000000, 0xFFFFFF);
  // let's hide it for now, so we don't see it yet
  tracker.visible = false;
  // add it to the scene
  main.add(tracker);

  // Store a reference so other objects/scenes can access it
  /** @type PolyendTracker */
  Projector.globals.tracker = tracker;

  // We want the scene controller to listen for midi on channel 16
  SceneController.midiChannel = 16;

  // You can either set up the scenes via the SceneController..
  await SceneController.setup([
    { id: 'intro', scenes: [SceneIntro] },
    { id: 0, scenes: [SceneVideosBuildup, ScenePadsOscilloscope]},
    { id: 1, scenes: [SynthwaveAnalyzer, SceneFireSparks]},
    { id: 2, scenes: [SceneAssetScope]},
    { id: 3, scenes: [SceneShaderBall, ScenePadsOscilloscopeWhite]},
    { id: 4, scenes: [ScenePump, SceneBarVisualizer]},
    { id: 5, scenes: [SceneProtracker]},
    { id: 6, scenes: [SceneBehringerTrucker]},
    { id: 7, scenes: [SceneVideosOutro]},

    // { id: 'image', scenes: [ExampleSceneImage] },
    // { id: 'video', scenes: [ExampleSceneVideo] },
    // { id: 'rendertarget', scenes: [ExampleSceneRenderTarget] },
    // { id: 'shader', scenes: [ExampleSceneShader] },
    // { id: 'particles', scenes: [ExampleSceneParticles] },
    // { id: 'synthwave', scenes: [SynthwaveAnalyzer] },
    // { id: 'protracker', scenes: [SceneProtracker] },
    // { id: 'osc', scenes: [ScenePadsOscilloscope] },
    // { id: 'lissajous', scenes: [SceneWheelLissajous] },
    // { id: 'scope', scenes: [SceneAssetScope] },
    /* Numeric id's (0 - 127) are reserved for MidiController */
  ]);

  /*
   * ..or build your own routing/logic based
   * on the available MidiController events
   */
  MidiController.on(MidiEvent.DEVICE, () => {
    SceneController.setSceneParameter();
  });
  // MidiController.on(MidiEvent.START, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.STOP, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.BEAT, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.BAR, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.SCENE_CHANGE, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.SCENE_PARAM, (evt) => { console.log(evt); });

  //
  tracker.visible = true;
  // Let's just start a defined scene
  SceneController.play('intro');
  // SceneController.play(7).setSceneParameter(0);
}

async function destroy() {
  // Cleanup is purely for Hot Reloading during Development
  SceneController.destroy();
  Projector.destroy();
  AudioController.destroy();
}
</script>

<template>
  <div id="app" ref="app" />
</template>

<style lang="scss">
@import './assets/scss/app';

#app {
  position: relative;
  min-height: 100vh;
  width: 100%;
  font-family: 'Pixel 4x4', sans-serif;
}
</style>
