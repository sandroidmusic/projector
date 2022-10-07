/* eslint-disable no-underscore-dangle,class-methods-use-this,no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import VueComponent from '@/utils/VueComponent.js';
import DeviceSelectorModal from '@/components/ui/DeviceSelectorModal.vue';

//----------------------------------
// Type Definitions
//----------------------------------

//----------------------------------
// Constants
//----------------------------------
const ANALYSER_STEREO = 'stereo';
const ANALYSER_LEFT = 'left';
const ANALYSER_RIGHT = 'right';

//----------------------------------
// Private Variables
//----------------------------------
let activeMediaStream = null;
let audioSourceNode = null;
let gainNode = null;
let audioContext = null;
const analyser = {
  /** @type {AnalyserNode} */
  stereo: null,
  /** @type {AnalyserNode} */
  left: null,
  /** @type {AnalyserNode} */
  right: null,
};
let fftSize = 4096;
let smoothingTimeConstant = 0.9;
let minDecibels = -90;
let maxDecibels = 0;


/**
 * Static Stage Class
 */
export default class AudioController {
  //---------------------------------------------------
  //
  //  Initialization
  //
  //---------------------------------------------------
  static async initialize(device = null) {
    if (device) {
      this.setActiveInput(device);
    } else {
      try {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          if (mediaStream) {
            const vm = VueComponent.create(DeviceSelectorModal, document.body, {
              type: 'audio',
              onSelected: (response) => {
                VueComponent.remove(vm);
                if (response.value) {
                  this.setActiveInput(response.value);
                }
                resolve();
              },
            });
          }
        });
      } catch (err) {
        console.warn(`Couldn't enumerate devices because: ${err.message}`);
      }
    }
    return null;
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  static get fftSize() {
    if (analyser.stereo) {
      return analyser.stereo.fftSize;
    }
    return fftSize;
  }

  static set fftSize(value) {
    fftSize = value;
    analyser.stereo.fftSize = value;
    analyser.left.fftSize = value;
    analyser.right.fftSize = value;
  }

  static get smoothingTimeConstant() {
    if (analyser.stereo) {
      return analyser.stereo.smoothingTimeConstant;
    }
    return smoothingTimeConstant;
  }

  static set smoothingTimeConstant(value) {
    smoothingTimeConstant = value;
    analyser.stereo.smoothingTimeConstant = value;
    analyser.left.smoothingTimeConstant = value;
    analyser.right.smoothingTimeConstant = value;
  }

  static get minDecibels() {
    if (analyser.stereo) {
      return analyser.stereo.minDecibels;
    }
    return minDecibels;
  }

  static set minDecibels(value) {
    minDecibels = value;
    analyser.stereo.minDecibels = value;
    analyser.left.minDecibels = value;
    analyser.right.minDecibels = value;
  }

  static get maxDecibels() {
    if (analyser.stereo) {
      return analyser.stereo.maxDecibels;
    }
    return maxDecibels;
  }

  static set maxDecibels(value) {
    maxDecibels = value;
    analyser.stereo.maxDecibels = value;
    analyser.left.maxDecibels = value;
    analyser.right.maxDecibels = value;
  }

  static get gain() {
    return gainNode.gain.value;
  }

  static set gain(value) {
    gainNode.gain.value = value;
  }

  /** @type {AudioContext} */
  static get context() {
    return audioContext;
  }

  static get analysers() {
    return analyser;
  }

  static get ANALYSER() {
    return {
      STEREO: ANALYSER_STEREO,
      LEFT: ANALYSER_LEFT,
      RIGHT: ANALYSER_RIGHT,
    };
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  static async setActiveInput(device) {
    activeMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        device,
        mandatory: {
          echoCancellation: false,
          noiseSuppression: false,
        },
      },
    });
    if (activeMediaStream) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioSourceNode = audioContext.createMediaStreamSource(activeMediaStream);

      gainNode = audioContext.createGain();
      audioSourceNode.connect(gainNode);

      analyser.stereo = audioContext.createAnalyser();
      analyser.stereo.fftSize = fftSize;
      analyser.stereo.smoothingTimeConstant = smoothingTimeConstant;
      analyser.stereo.minDecibels = minDecibels;
      analyser.stereo.maxDecibels = maxDecibels;

      analyser.left = audioContext.createAnalyser();
      analyser.left.fftSize = fftSize;
      analyser.left.smoothingTimeConstant = smoothingTimeConstant;
      analyser.left.minDecibels = minDecibels;
      analyser.left.maxDecibels = maxDecibels;

      analyser.right = audioContext.createAnalyser();
      analyser.right.fftSize = fftSize;
      analyser.right.smoothingTimeConstant = smoothingTimeConstant;
      analyser.right.minDecibels = minDecibels;
      analyser.right.maxDecibels = maxDecibels;


      gainNode.connect(analyser.stereo);
      const splitter = audioContext.createChannelSplitter(2);
      splitter.channelCountMode = 'explicit';
      gainNode.connect(splitter);
      splitter.connect(analyser.left, 0, 0);
      splitter.connect(analyser.right, 1, 0);

      console.log('Active Audio Device ID:', device);
    } else {
      console.warn('Media Device not available:', device);
    }
  }

  static getFrequencyData(numSegments = null, analyserType = ANALYSER_STEREO) {
    const ianalyser = analyser[analyserType];
    if (ianalyser) {
      const length = ianalyser.frequencyBinCount;
      const data = new Uint8Array(length);
      ianalyser.getByteFrequencyData(data);

      const maxSegments = Math.floor(ianalyser.fftSize / 2);
      if (numSegments > maxSegments) {
        console.warn(`numSegments (${numSegments}) exceeds available length (${maxSegments}).`);
        numSegments = maxSegments;
      }
      if (numSegments !== null) {
        let arr = [];
        const out = [];
        for (let i = 0; i < length; i += 1) {
          arr.push(data[i]);
          if (arr.length === numSegments || (i + 1) === length) {
            out.push(arr.reduce((a, b) => (a + b)) / numSegments);
            arr = [];
          }
        }
        return { data: out, length: numSegments };
      }
      return { data, length };
    }
    return { data: [], length: 0 };
  }

  static getWaveformData(numSegments = null, analyserType = ANALYSER_STEREO) {
    const ianalyser = analyser[analyserType];
    if (ianalyser) {
      const length = ianalyser.frequencyBinCount;
      const data = new Uint8Array(length);
      ianalyser.getByteTimeDomainData(data);

      const maxSegments = Math.floor(ianalyser.fftSize / 2);
      if (numSegments > maxSegments) {
        console.warn(`numSegments (${numSegments}) exceeds available length (${maxSegments}).`);
        numSegments = maxSegments;
      }
      if (numSegments !== null) {
        let arr = [];
        const out = [];
        for (let i = 0; i < length; i += 1) {
          arr.push(data[i]);
          if (arr.length === numSegments || (i + 1) === length) {
            out.push(arr.reduce((a, b) => (a + b)) / numSegments);
            arr = [];
          }
        }
        return { data: out, length: numSegments };
      }
      return { data, length };
    }
    return { data: [], length: 0 };
  }

  static destroy() {
    if (audioSourceNode) {
      audioSourceNode.disconnect();
    }
    audioSourceNode = null;
    analyser.stereo = null;
    analyser.left = null;
    analyser.right = null;
    audioContext = null;
    activeMediaStream = null;
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
}
