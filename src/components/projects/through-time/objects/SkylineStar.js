/* eslint-disable no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import * as PIXI from 'pixi.js';
import Tween from '@/components/helpers/Tween.js';
import Random from '@/utils/Random.js';

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Static Material Creation Helper
 */
export default class SkylineStar extends PIXI.Graphics {
  //---------------------------------------------------
  //
  //  Initialization
  //
  //---------------------------------------------------
  constructor() {
    super();

    const color = Random.float.minmax(0xFFFF86, 0xFFFFFF);
    const chance = Math.random() > 0.95;
    if (chance) {
      const size = Random.float.minmax(2, 5);
      this.lineStyle(1, color, 1);
      this.moveTo(-size, 0);
      this.lineTo(size, 0);
      this.moveTo(0, -size);
      this.lineTo(0, size);
      this.angle = Random.int.minmax(0, 360);
    } else {
      const size = Random.float.minmax(2, 4);
      this.beginFill(color);
      this.drawRect(-size / 2, -size / 2, size / 2, size / 2);
      this.endFill();
    }

    const tween = new Tween();
    const delay = Random.float.minmax(0, 2);
    tween.fromTo(this,
      { alpha: 0.3 },
      { alpha: 1, duration: 2, ease: 'sine.inOut', delay, repeat: -1, yoyo: true},
    );
  }
  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
}
