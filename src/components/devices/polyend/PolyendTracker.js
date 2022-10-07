/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import { Group } from 'three';
import PTBody from '@/components/devices/polyend/objects/PTBody.js';
import PTScreen from '@/components/devices/polyend/objects/PTScreen.js';
import PTJogWheel from '@/components/devices/polyend/objects/PTJogWheel.js';
import PTPadsGrid from '@/components/devices/polyend/objects/PTPadsGrid.js';
import PTScreenKeys from '@/components/devices/polyend/objects/PTScreenKeys.js';
import PTFunctionKeys from '@/components/devices/polyend/objects/PTFunctionKeys.js';
import PTNavigationKeys from '@/components/devices/polyend/objects/PTNavigationKeys.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
let COLOR_FILL = 0x000000;
let COLOR_BORDER = 0xFFFFFF;

/**
 * Polyend Tracker
 */
export default class PolyendTracker extends Group {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor(fillColor = null, borderColor = null) {
    super();

    /** @private */
    this._body = null;
    /** @private */
    this._screenKeys = null;
    /** @private */
    this._padsGrid = null;
    /** @private */
    this._functionKeys = null;
    /** @private */
    this._navigationKeys = null;
    /** @private */
    this._jogWheel = null;
    /** @private */
    this._screen = null;

    if (fillColor !== null) {
      COLOR_FILL = fillColor;
    }
    if (borderColor !== null) {
      COLOR_BORDER = borderColor;
    }

    this.createChildren();
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  /**
   * Polyend Tracker Width
   * @returns {number}
   */
  get width() {
    return this.body.width;
  }

  /**
   * Polyend Tracker Height
   * @returns {number}
   */
  get height() {
    return this.body.height;
  }

  static get COLOR_FILL() {
    return COLOR_FILL;
  }

  static set COLOR_FILL(value) {
    COLOR_FILL = value;
  }

  static get COLOR_BORDER() {
    return COLOR_BORDER;
  }

  static set COLOR_BORDER(value) {
    COLOR_BORDER = value;
  }

  /**
   * Return the Polyend Tracker Body Object
   * @type {PTBody}
   */
  get body() {
    return this._body;
  }

  /**
   * Return the Polyend Tracker Screen Keys Object
   * @type {PTScreenKeys}
   */
  get screenKeys() {
    return this._screenKeys;
  }

  /**
   * Return the Polyend Tracker Pads Grid Object
   * @type {PTPadsGrid}
   */
  get padsGrid() {
    return this._padsGrid;
  }

  /**
   * Return the Polyend Tracker Function Keys Object
   * @type {PTFunctionKeys}
   */
  get functionKeys() {
    return this._functionKeys;
  }

  /**
   * Return the Polyend Tracker Navigation Keys Object
   * @type {PTNavigationKeys}
   */
  get navigationKeys() {
    return this._navigationKeys;
  }

  /**
   * Return the Polyend Tracker Jog Wheel Object
   * @type {PTJogWheel}
   */
  get jogWheel() {
    return this._jogWheel;
  }

  /**
   * Return the Polyend Tracker Screen Object
   * @type {PTScreen}
   */
  get screen() {
    return this._screen;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  resetFillMaterials(color = null) {
    this.body.resetFillMaterial(color);
    this.screenKeys.resetFillMaterial(color);
    this.padsGrid.resetFillMaterial(color);
    this.functionKeys.resetFillMaterial(color);
    this.navigationKeys.resetFillMaterial(color);
    this.jogWheel.resetFillMaterial(color);
    this.screen.resetFillMaterial(color);
  }

  resetBorderMaterials(color = null) {
    this.body.resetBorderMaterial(color);
    this.screenKeys.resetBorderMaterial(color);
    this.padsGrid.resetBorderMaterial(color);
    this.functionKeys.resetBorderMaterial(color);
    this.navigationKeys.resetBorderMaterial(color);
    this.jogWheel.resetBorderMaterial(color);
    this.screen.resetBorderMaterial(color);
  }

  resetMaterials(color = null) {
    this.resetFillMaterials(color);
    this.resetBorderMaterials(color);
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  /** @private */
  createChildren() {
    const body = new PTBody(COLOR_FILL, COLOR_BORDER);
    this.add(body);
    this._body = body;

    const screenKeys = new PTScreenKeys(COLOR_FILL, COLOR_BORDER);
    screenKeys.position.set(-52.675, -21.5, 0.001);
    this.add(screenKeys);

    const padsGrid = new PTPadsGrid(COLOR_FILL, COLOR_BORDER);
    padsGrid.position.set(-52.675, -68.325, 0.001);
    this.add(padsGrid);

    const functionKeys = new PTFunctionKeys(COLOR_FILL, COLOR_BORDER);
    functionKeys.position.set(84.5, 57.35, 0.001);
    this.add(functionKeys);

    const navigationKeys = new PTNavigationKeys(COLOR_FILL, COLOR_BORDER);
    navigationKeys.position.set(84.3, -11.6, 0.001);
    this.add(navigationKeys);

    const jogWheel = new PTJogWheel(COLOR_FILL, COLOR_BORDER);
    jogWheel.position.set(85.45, -69.55, 0.01);
    this.add(jogWheel);

    const screen = new PTScreen(COLOR_FILL, COLOR_BORDER);
    screen.position.set(-53.5, 41, 0.01);
    this.add(screen);

    this._screenKeys = screenKeys;
    this._padsGrid = padsGrid;
    this._functionKeys = functionKeys;
    this._navigationKeys = navigationKeys;
    this._jogWheel = jogWheel;
    this._screen = screen;
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
}
