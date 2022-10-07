/* eslint-disable no-unused-vars */
// noinspection ES6UnusedImports
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

/**
 * Default Tracker Setup
 */
export default class Particle {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  /**
   *
   * @param position {THREE.Vector3}
   * @param rotation {Number}
   * @param size {Number}
   * @param color {Number}
   * @param alpha {Number}
   * @param velocity {Number}
   * @param angle {Number}
   * @param gravity {Number}
   * @param growth {Number}
   * @param lifespan {Number}
   */
  constructor(position, rotation, size, color, alpha, velocity, angle, gravity = 0, growth = 1, lifespan = Infinity) {
    this.origin = {
      position,
      rotation,
      size,
      color,
      alpha,
      velocity,
      angle,
      gravity,
      growth,
      lifespan,
    };
    this.dead = false;
    this.progress = 0;
    this.life = 0;
    this.id = uuidv4();
    this.reset();
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  reset() {
    const origin = this.origin;
    const keys = Object.keys(origin);
    keys.forEach((key) => {
      const value = origin[key];
      if (value.clone) {
        this[key] = value.clone();
      } else {
        this[key] = value;
      }
    });
    this.dead = false;
    this.life = 0;
    this.progress = 0;
  }
}
