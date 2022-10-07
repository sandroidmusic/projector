/* eslint-disable no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import { gsap } from 'gsap';

/**
 * GSAP Helper
 */
export default class Tween {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    /** @private */
    this.arr = [];
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  get tweens() {
    return this.arr;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  /**
   * @param {gsap.TweenTarget} target
   * @param {Object} vars
   * @returns {gsap.core.Tween}
   */
  to(target, vars) {
    const tween = gsap.to(target, vars);
    this.arr.push(tween);
    return tween;
  }

  /**
   * @param {gsap.TweenTarget} target
   * @param {Object} from
   * @param {Object} to
   * @returns {gsap.core.Tween}
   */
  fromTo(target, from, to) {
    const tween = gsap.fromTo(target, from, to);
    this.arr.push(tween);
    return tween;
  }

  /**
   * @param {Number} delay
   * @param {Function} callback
   * @param {*[]} params
   * @returns {gsap.core.Tween}
   */
  delayed(delay, callback, params = null) {
    const tween = gsap.delayedCall(delay, callback, params);
    this.arr.push(tween);
    return tween;
  }

  /**
   * @param {gsap.core.Tween} tween
   */
  kill(tween) {
    const tweens = this.arr;
    const index = tweens.findIndex(t => t === tween);
    if (index !== -1) {
      tweens.splice(index, 1);
    }
    tween.kill();
  }

  /**
   * @param {gsap.TweenTarget} target
   */
  killTweensFor(target) {
    const tweens = this.arr;
    gsap.killTweensOf(target);
    tweens.forEach((tween, index) => {
      const targets = tween.targets();
      if (targets.includes(target)) {
        tweens.splice(index, 1);
      }
    });
  }

  killAll() {
    this.arr.forEach((tween) => {
      tween.kill();
    });
    this.arr = [];
  }

  destroy() {
    this.killAll();
  }
}
