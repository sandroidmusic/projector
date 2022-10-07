/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import { Group } from 'three';
import * as THREE from 'three';
import ThreeCreate from '@/components/helpers/ThreeCreate';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Polyend Tracker Screen Objects
 */
export default class PTScreen extends Group {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor(fillColor, borderColor) {
    super();

    /** @private */
    this._fill = null;
    /** @private */
    this._fillColor = fillColor;
    /** @private */
    this._border = null;
    /** @private */
    this._borderColor = borderColor;
    /** @private */
    this._fillMaterial = null;
    /** @private */
    this._borderMaterial = null;

    this.createChildren();
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  get fill() {
    return this._fill;
  }

  get fillColor() {
    return this.fill.material.color;
  }

  set fillColor(value) {
    this.fill.material.color = new THREE.Color(value);
  }

  get border() {
    return this._border;
  }

  get borderColor() {
    return this.border.material.color;
  }

  set borderColor(value) {
    this.border.material.color = new THREE.Color(value);
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  resetFillMaterial(color = null) {
    this.fill.material = this._fillMaterial;
    if (color !== null) {
      this.fillColor = color;
    }
  }

  resetBorderMaterial(color = null) {
    this.border.material = this._borderMaterial;
    if (color !== null) {
      this.borderColor = color;
    }
  }

  resetMaterials(color = null) {
    this.resetFillMaterial(color);
    this.resetBorderMaterial(color);
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  /** @private */
  createChildren() {
    const screenOptions = {
      size: { x: 160, y: 90, z: 0 },
      radius: 0.015,
    };
    const fill = ThreeCreate.roundedPlane({
      ...screenOptions,
      color: this._fillColor,
    });
    const border = ThreeCreate.roundedPlane({
      ...screenOptions,
      outline: true,
      color: this._borderColor,
    });

    this.add(fill);
    this.add(border);

    this._fill = fill;
    this._border = border;
    this._fillMaterial = fill.material.clone();
    this._borderMaterial = border.material.clone();
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
}
