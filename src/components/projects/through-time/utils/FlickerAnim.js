/* eslint-disable no-param-reassign */
//----------------------------------
// Imports
//----------------------------------
import Tween from '@/components/helpers/Tween.js';
import Random from '@/utils/Random.js';

const tween = new Tween();
const ids = {};

export default class FlickerAnim {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------

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

  static add(id, obj, property, propFrom, propTo, timeMin, timeMax) {
    clearTimeout(ids[id]);
    let timeout;
    const func = () => {
      const flicker = Math.random() > 0.5;
      if (flicker) {
        obj[property] = propTo;
        const propsTo = {};
        propsTo[property] = propFrom;
        propsTo.duration = 0.05;
        propsTo.delay = 0.1;
        tween.to(obj, propsTo);
        timeout = Random.int.minmax(timeMin, timeMax);
      } else {
        obj[property] = propFrom;
        const propsFrom = {};
        propsFrom[property] = propTo;
        propsFrom.duration = 1;
        propsFrom.delay = 0.1;

        const propsTo = {};
        propsTo[property] = propFrom;
        propsTo.duration = 0.05;
        propsTo.delay = 1.1;

        tween.to(obj, propsFrom);
        tween.to(obj, propsTo);

        timeout = Random.int.minmax(timeMin, timeMax);
      }
      ids[id] = setTimeout(func, timeout);
    };
    func();
  }

  static remove(id) {
    clearTimeout(ids[id]);
  }
}
