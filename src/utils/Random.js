/* eslint-disable no-restricted-properties,no-param-reassign */
//----------------------------------
// Private Variables
//----------------------------------

export default class Random {
  static get float() {
    return {
      number: (max = 1) => Math.random() * max,
      minmax: (min, max) => Math.random() * (max - min) + min,
    };
  }

  static get int() {
    return {
      number: (max = 1) => Math.floor(Math.random() * (max + 0.99)),
      minmax: (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
    };
  }
}
