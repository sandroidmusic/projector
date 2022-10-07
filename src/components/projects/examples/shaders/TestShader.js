//----------------------------------
// Import
//----------------------------------
import * as THREE from 'three';

//----------------------------------
// Fragment Shader Code
//----------------------------------
const fragment = `
varying vec3 normalWorldSpace;

void main() {
  vec3 color = vec3(normalWorldSpace) + 0.5;
  float alpha = 1.0;

  gl_FragColor = vec4(color, alpha);
}
`;

//----------------------------------
// Vertex Shader Code
//----------------------------------
const vertex = `
uniform float time;
uniform float animationTime;

varying vec3 normalWorldSpace;

vec3 modifyPosition(vec3 startPosition) {
  float inverseAnimationTime = 1.0 - animationTime;

  float frequency = 8.0 * inverseAnimationTime;
  float amplitude = 4.0 * inverseAnimationTime;

  float bump =
  sin(time + startPosition.x * frequency) *
  sin(time + startPosition.y * frequency) *
  sin(time + startPosition.z * frequency);

  vec3 offset = normalWorldSpace * bump * amplitude;

  return startPosition + offset;
}

void main() {
  vec4 normalHomogeneousWorldSpace = modelMatrix * vec4(normal, 1.0);
  normalWorldSpace = normal;

  vec3 modifiedPosition = modifyPosition(position);

  vec4 modelSpaceCoordinates = vec4(modifiedPosition, 1.0);
  vec4 worldSpaceCoordinates = modelMatrix * modelSpaceCoordinates;
  vec4 viewSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinates = projectionMatrix * viewSpaceCoordinates;

  gl_Position = screenSpaceCoordinates;
}
`;

/**
 * Test Shader Class
 */
export default class TestShader {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor(time = 0.0, animationTime = 1.0) {
    this.uniforms = {
      time: { value: time },
      animationTime: { value: animationTime },
    };
    this.mat = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: this.uniforms,
    });
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  get material() {
    return this.mat;
  }

  set material(value) {
    this.mat = value;
  }

  /** @return {Number} */
  get time() {
    return this.uniforms.time.value;
  }

  set time(value) {
    this.uniforms.time.value = value;
  }

  /** @return {Number} */
  get animationTime() {
    return this.uniforms.animationTime.value;
  }

  set animationTime(value) {
    this.uniforms.animationTime.value = value;
  }
}
