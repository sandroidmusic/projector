/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import { Group } from 'three';
import ThreeCreate from '@/components/helpers/ThreeCreate';
import * as THREE from 'three';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Polyend Tracker Navigation Keys Objects
 */
export default class PTNavigationKeys extends Group {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor(fillColor, borderColor) {
    super();

    /** @private */
    this._fills = null;
    /** @private */
    this._fillColor = fillColor;
    /** @private */
    this._borders = null;
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
  get fills() {
    return this._fills;
  }

  get fillColor() {
    return this.fills[0].material.color;
  }

  set fillColor(value) {
    const arr = this.fills;
    arr.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.material.color = new THREE.Color(value);
    });
  }

  get fillVisible() {
    return this.fills[0].visible;
  }

  set fillVisible(value) {
    const arr = this.fills;
    arr.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.visible = value;
    });
  }

  get borders() {
    return this._borders;
  }

  get borderColor() {
    return this.borders[0].material.color;
  }

  set borderColor(value) {
    const arr = this.borders;
    arr.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.material.color = new THREE.Color(value);
    });
  }

  get borderVisible() {
    return this.borders[0].visible;
  }

  set borderVisible(value) {
    const arr = this.borders;
    arr.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.visible = value;
    });
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  resetFillMaterial(color = null) {
    const arr = this.fills;
    arr.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.material = this._fillMaterial;
    });
    if (color !== null) {
      this.fillColor = color;
    }
  }

  resetBorderMaterial(color = null) {
    const arr = this.borders;
    arr.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.material = this._borderMaterial;
    });
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
      func: ThreeCreate.roundedPlane,
      size: { x: 16, y: 16, z: 1 },
      grid: { x: 5, y: 2 },
      gap: { x: 3.5, y: 3.5 },
      radius: 0.15,
    };

    this._fillMaterial = new THREE.MeshBasicMaterial({
      wireframe: false,
      map: null,
      color: this._fillColor,
    });
    const fills = ThreeCreate.grid({
      ...options,
      material: this._fillMaterial,
    });

    this._borderMaterial = new THREE.LineBasicMaterial({ color: this._borderColor });
    const borders = ThreeCreate.grid({
      ...options,
      outline: true,
      material: this._borderMaterial,
    });

    fills.forEach(button => this.add(button));
    borders.forEach(button => this.add(button));

    this._fills = fills;
    this._borders = borders;
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
}
