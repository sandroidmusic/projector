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
// import MidiEvent from '@/components/controllers/midi/objects/MidiEvent.js';

import PolyendTracker from '@/components/devices/polyend/PolyendTracker.js';
import SceneStore from '@/components/projects/through-time/SceneStore.js';
import SceneSkyline from '@/components/projects/through-time/SceneSkyline.js';
import SceneSpace from '@/components/projects/through-time/SceneSpace.js';
import ScenePlanet from '@/components/projects/through-time/ScenePlanet.js';

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
  // you will see the device-id in the console
  await AudioController.initialize('default');

  // Initialize the MidiController
  // again, if no device-name is passed, you will get a popup
  // you will see the device-name in the console
  if (!MidiController.initialized) {
    await MidiController.initialize({
      device: 'Tracker',
      bpm: 122,
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
    { id: 0, scenes: [SceneStore] },
    { id: 1, scenes: [SceneSkyline] },
    { id: 2, scenes: [SceneSpace] },
    { id: 3, scenes: [ScenePlanet] },
  ]);

  /*
   * ..or build your own routing/logic based
   * on the available MidiController events
   */
  // MidiController.on(MidiEvent.DEVICE, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.START, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.STOP, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.BEAT, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.BAR, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.SCENE_CHANGE, (evt) => { console.log(evt); });
  // MidiController.on(MidiEvent.SCENE_PARAM, (evt) => { console.log(evt); });

  tracker.visible = false;
  // Let's just start a defined scene
  SceneController.play(0);

  /*
  Scenes and a single Parameter for every scene can be changed via midi:
  - Scene Change CC: 20
  - Scene Parameter CC: 21

  The scene controller also exposes methods to change both:

  - SceneController.play(sceneId)
  - SceneController.setSceneParameter(value)

  you can even combine the two. Example:
  SceneController.play(7).setSceneParameter(0);
  */
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
