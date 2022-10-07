/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import { WebMidi } from 'webmidi';
import MidiEvent from '@/components/controllers/midi/objects/MidiEvent.js';
import DeviceSelectorModal from '@/components/ui/DeviceSelectorModal.vue';
import VueComponent from '@/utils/VueComponent.js';

//----------------------------------
// Type Definitions
//----------------------------------
/**
 * @typedef  {Object} MidiControllerSettings
 * @property {String} device            Name of the Midi Device you are trying to connect to
 * @property {Number} bpm               Tempo set on the device
 * @property {Number} [effectiveBPM]    Useful if you are using higher tempos for higher precision. This would reflect the actual/felt tempo
 * @property {Number} [bpb]             Beats per Bar. In case it's not just 4 on the floor. Defaults to 4
 * @property {Number} [ccSceneChange]   The CC to listen to for MidiEvent.SCENE_CHANGE. Default CC is 20
 * @property {Number} [ccSceneValue]    The CC to listen to for MidiEvent.SCENE_VALUE. Default CC is 21
 */

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
let activeInput = null;
let initialized = false;
let inputCheck = null;

let tempo = 0;
let tempoFactor = 0;
let beatsPerBar = 4;

let sceneChangeCC = 20;
let sceneValueCC = 21;

let tick = 0;
let numBars = 0;
let numBeats = 0;
let beatLength = 0;
let barLength = 0;

let intHandlers = {};
let extHandlers = {};

/**
 * Static Stage Class
 */
export default class MidiController {
  //---------------------------------------------------
  //
  //  Initialization
  //
  //---------------------------------------------------
  /**
   * @param {MidiControllerSettings} settings
   * @returns {Promise<void>}
   */
  static async initialize(settings) {
    const { device, bpm, bpb, effectiveBPM, ccSceneChange, ccSceneValue } = {
      device: null,
      bpm: null,
      effectiveBPM: null,
      bpb: 4,
      ccSceneChange: 20,
      ccSceneValue: 21,
      ...settings,
    };
    await WebMidi.enable();

    tempo = bpm;
    tempoFactor = effectiveBPM ? effectiveBPM / bpm : 1;

    beatsPerBar = bpb;

    beatLength = ((1 / tempo) * 60);
    barLength = beatLength * bpb;

    sceneChangeCC = ccSceneChange;
    sceneValueCC = ccSceneValue;

    if (device) {
      this.setActiveInput(device);
    } else {
      const vm = VueComponent.create(DeviceSelectorModal, document.body, {
        type: 'midi',
        onSelected: (response) => {
          VueComponent.remove(vm);
          if (response.value) {
            this.setActiveInput(response.value);
          }
        },
      });
    }
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  static get availableInputs() {
    return WebMidi.inputs;
  }

  static get initialized() {
    return initialized;
  }

  static get tempo() {
    return tempo || 0;
  }

  static get beatLength() {
    return beatLength;
  }

  static get barLength() {
    return barLength;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  static setActiveInput(device, log = true) {
    activeInput = WebMidi.getInputByName(device);
    if (activeInput) {
      intHandlers.handleMidiClock = this.handleMidiClock.bind(this);
      intHandlers.handleMidiStart = this.handleMidiStart.bind(this);
      intHandlers.handleMidiStop = this.handleMidiStop.bind(this);
      intHandlers.handleMidiMessage = this.handleMidiMessage.bind(this);

      activeInput.addListener('clock', intHandlers.handleMidiClock);
      activeInput.addListener(MidiEvent.START, intHandlers.handleMidiStart);
      activeInput.addListener(MidiEvent.STOP, intHandlers.handleMidiStop);
      activeInput.addListener(MidiEvent.MESSAGE, intHandlers.handleMidiMessage);

      console.log(`Active Midi Device: ${device}`);
      initialized = true;
      this.emit(MidiEvent.DEVICE, { name: device });
    } else {
      if (log) {
        console.warn(`Midi Device "${device}" currently not available.`);
      }
      inputCheck = setInterval(() => {
        if (WebMidi.inputs.length > 0) {
          clearInterval(inputCheck);
          this.setActiveInput(device, false);
        }
      }, 500);
    }
  }

  static on(event, listener) {
    if (!extHandlers[event]) {
      extHandlers[event] = [];
    }
    extHandlers[event].push(listener);
  }

  static off(event, listener = null) {
    const handlers = extHandlers[event] || [];
    if (listener) {
      const index = handlers.findIndex(handler => handler === listener);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    } else {
      extHandlers[event] = [];
    }
  }

  static async destroy() {
    clearInterval(inputCheck);
    if (activeInput) {
      activeInput.removeListener('clock', intHandlers.handleMidiClock);
      activeInput.removeListener(MidiEvent.START, intHandlers.handleMidiStart);
      activeInput.removeListener(MidiEvent.STOP, intHandlers.handleMidiStop);
      activeInput.removeListener(MidiEvent.MESSAGE, intHandlers.handleMidiMessage);
      activeInput = null;
      await WebMidi.disable();
    }

    extHandlers = {};
    intHandlers = {};
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  /* @private */
  static emit(event, data = null) {
    const handlers = extHandlers[event] || [];
    handlers.forEach((handler) => {
      handler({ type: event, ...data });
    });
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  /* @private */
  static handleMidiClock() {
    if (tick % (24 / tempoFactor) === 0) {
      const timestamp = WebMidi.time;
      if (numBeats % beatsPerBar === 0) {
        numBeats = 0;
        numBars += 1;
        this.emit(MidiEvent.BAR, { bar: numBars, barLength, tempo, timestamp });
      }
      numBeats += 1;
      this.emit(MidiEvent.BEAT, { beat: numBeats, beatLength, tempo, timestamp });
    }
    tick += 1;
  }

  /* @private */
  static handleMidiStart() {
    this.emit(MidiEvent.START);
  }

  /* @private */
  static handleMidiStop() {
    this.emit(MidiEvent.STOP);
  }

  /* @private */
  static handleMidiMessage(evt) {
    this.emit(MidiEvent.MESSAGE, evt);
    const message = evt.message;
    if (message.type === MidiEvent.PROGRAM_CHANGE) {
      this.emit(MidiEvent.PROGRAM_CHANGE, { channel: message.channel, value: message.dataBytes[0] });
    } else if (message.type === MidiEvent.CONTROL_CHANGE) {
      const [cc, value] = message.dataBytes;
      this.emit(MidiEvent.CONTROL_CHANGE, { channel: message.channel, cc, value });
      if (cc === sceneChangeCC) {
        this.emit(MidiEvent.SCENE_CHANGE, { channel: message.channel, value });
      } else if (cc === sceneValueCC) {
        this.emit(MidiEvent.SCENE_PARAM, { channel: message.channel, value });
      }
    }
  }
}
