/* eslint-disable no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import * as PIXI from 'pixi.js';
import Tween from '@/components/helpers/Tween.js';
import { GlowFilter } from 'pixi-filters';
import PixiCanvas from '@/components/helpers/PixiCanvas.js';

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Static Material Creation Helper
 */
export default class Crystal extends PIXI.Container {
  //---------------------------------------------------
  //
  //  Initialization
  //
  //---------------------------------------------------
  constructor(type, color = 0xFFFFFF) {
    super();
    this.rotInterval = null;
    this.spriteIndex = 0;
    this.sprites = [];
    this.tween = new Tween();
    this.glowTween = null;
    this.insideContainer = new PIXI.Container();
    const sprite1 = PIXI.Sprite.from(PixiCanvas.assets[`crystal_${type}_01`]);
    const sprite2 = PIXI.Sprite.from(PixiCanvas.assets[`crystal_${type}_02`]);
    const sprite3 = PIXI.Sprite.from(PixiCanvas.assets[`crystal_${type}_03`]);

    sprite1.anchor.set(0.5, 0.5);
    sprite2.anchor.set(0.5, 0.5);
    sprite3.anchor.set(0.5, 0.5);

    sprite2.alpha = 0;
    sprite3.alpha = 0;

    this.insideContainer.addChild(sprite1);
    this.insideContainer.addChild(sprite2);
    this.insideContainer.addChild(sprite3);
    this.addChild(this.insideContainer);

    this.glowFilter = new GlowFilter({
      distance: 100,
      outerStrength: 5,
      color,
    })

    this.sprites = [sprite1, sprite2, sprite3];
    this.spriteIndex = 0;
  }
  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  startRotationAnimation() {
    clearInterval(this.rotInterval);
    this.rotInterval = setInterval(() => {
      const oldIndex = this.spriteIndex;
      let newIndex = this.spriteIndex + 1
      if (newIndex >= this.sprites.length) {
        newIndex = 0;
      }

      const fromSprite = this.sprites[oldIndex];
      const toSprite = this.sprites[newIndex];

      this.tween.to(fromSprite, { alpha: 0, duration: 0.508, delay: 0.25});
      this.tween.to(toSprite, { alpha: 1, duration: 0.508});
      this.spriteIndex = newIndex;
    }, 1016 / 2);
  }
  stopRotationAnimation() {
    clearInterval(this.rotInterval);
  }

  startGlowAnimation(distance = 100, minStrength = 2, maxStrength = 5, color = null) {
    const glow = this.glowFilter;
    glow.distance = distance;
    if (color) {
      glow.color = color;
    }
    glow.outerStrength = minStrength;

    this.insideContainer.filters = [glow];
    this.glowTween = this.tween.fromTo(glow,
      { outerStrength: minStrength },
      { outerStrength: maxStrength, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true},
    );
  }

  stopGlowAnimation(duration) {
    this.glowTween.kill();
    this.tween.to(this.glowFilter, { outerStrength: 0, duration, ease: 'sine.inOut'});
  }

  pulsate() {
    const sprite = PIXI.Sprite.from(PixiCanvas.assets.crystal_small_01);
    this.addChildAt(sprite, 0);
    sprite.anchor.set(0.5, 0.5);
    this.tween.to(sprite.scale, { x: 2.5, y: 2.5, duration: 0.75 });
    this.tween.to(sprite, { alpha: 0, duration: 0.75, onComplete: () => {
      this.removeChildAt(0);
    }});
  }
  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
}
