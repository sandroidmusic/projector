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
 * Polyend Tracker Body Objects
 */
export default class PTBody extends Group {
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
  get width() {
    return 284; // originally: 282
  }

  get height() {
    return 209; // originally: 207
  }

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
    const options = {
      position: { x: 0, y: 0, z: 0 },
      size: { x: this.width, y: this.height, z: 0 },
    };

    const fill = ThreeCreate.plane({
      ...options,
      color: this._fillColor,
    });
    this.add(fill);

    const border = ThreeCreate.plane({
      ...options,
      color: this._borderColor,
      outline: true,
    });
    border.position.z = 0.001;
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
