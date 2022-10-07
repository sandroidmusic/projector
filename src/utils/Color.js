/* eslint-disable no-restricted-properties */
//----------------------------------
// Private Variables
//----------------------------------

export default class Color {
  static randomHex(asInteger = false) {
    if (!asInteger) {
      return `#${(`00000${Math.floor(Math.random() * Math.pow(16, 6)).toString(16)}`).slice(-6)}`;
    }
    return parseInt(`0x${(`00000${Math.floor(Math.random() * Math.pow(16, 6)).toString(16)}`).slice(-6)}`, 16);
  }

  static randomHexDark() {
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
      color += (`0${Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)}`).slice(-2);
    }
    return color;
  }

  static randomHexLight() {
    let color = '#';
    const factor = Math.floor(Math.random() * (3 - 2 + 1) + 2);
    for (let i = 0; i < 3; i += 1) {
      color += (`0${Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / factor).toString(16)}`).slice(-2);
    }
    return color;
  }

  static randomRgb() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    return `rgba(${red}, ${green}, ${blue})`;
  }

  static randomRgbDark() {
    const red = Math.floor(Math.random() * 256 / 2);
    const green = Math.floor(Math.random() * 256 / 2);
    const blue = Math.floor(Math.random() * 256 / 2);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  static randomRgbLight() {
    const factor = Math.floor(Math.random() * (3 - 2 + 1) + 2);
    const red = Math.floor((1 + Math.random()) * 256 / factor);
    const green = Math.floor((1 + Math.random()) * 256 / factor);
    const blue = Math.floor((1 + Math.random()) * 256 / factor);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  static randomHsl() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = `${Math.floor(Math.random() * (100 + 1))}%`;
    const lightness = `${Math.floor(Math.random() * (100 + 1))}%`;
    return `hsl(${hue}, ${saturation}, ${lightness})`;
  }

  static randomHslDark() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = `${Math.floor(Math.random() * (100 + 1))}%`;
    const lightness = `${Math.floor(Math.random() * (100 / 2 + 1))}%`;
    return `hsl(${hue}, ${saturation}, ${lightness})`;
  }

  static randomHslLight() {
    const factor = Math.floor(Math.random() * (3 - 2 + 1) + 2);
    const hue = Math.floor(Math.random() * 360);
    const saturation = `${Math.floor(Math.random() * (100 + 1))}%`;
    const lightness = `${Math.floor((1 + Math.random()) * (100 / factor + 1))}%`;
    return `hsl(${hue}, ${saturation}, ${lightness})`;
  }
}
