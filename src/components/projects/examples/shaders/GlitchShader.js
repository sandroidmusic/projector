//----------------------------------
// Import
//----------------------------------
import * as THREE from 'three';

//----------------------------------
// Fragment Shader Code
//----------------------------------
const fragment = `
uniform float iTime;
uniform sampler2D iChannel0;

varying vec2 vUv;

float hash(vec2 p) {
  float h = dot(p,vec2(127.1,311.7));
  return -1.0 + 2.0*fract(sin(h)*43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  vec2 u = f*f*(3.0-2.0*f);

  return mix(mix(hash( i + vec2(0.0,0.0) ),
    hash( i + vec2(1.0,0.0) ), u.x),
    mix( hash( i + vec2(0.0,1.0) ),
    hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

float noise(vec2 p, int oct) {
  mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
  float f  = 0.0;

  for(int i = 1; i < 3; i++){
    float mul = 1.0/pow(2.0, float(i));
    f += mul*noise(p);
    p = m*p;
  }

  return f;
}

void main() {
  // vec2 p = gl_FragCoord.xy / iResolution.xy;
  // vec2 p = -1.0 + 2.0 *vUv;

  // vec2 uv = fragCoord.xy / iResolution.xy;
  vec2 uv = -1.0 + 1.0 *vUv;

  float glitch = pow(cos(iTime*0.5)*1.2+1.0, 1.2);

  if(noise(iTime+vec2(0, 0))*glitch > 0.62){
    uv.y = mod(uv.y+noise(vec2(iTime*4.0, 0)), 1.0);
  }

  vec2 hp = vec2(0.0, uv.y);
  float nh = noise(hp*7.0+iTime*10.0, 3) * (noise(hp+iTime*0.3)*0.8);
  nh += noise(hp*100.0+iTime*10.0, 3)*0.02;
  float rnd = 0.0;
  if(glitch > 0.0){
    rnd = hash(uv);
    if(glitch < 1.0){
      rnd *= glitch;
    }
  }
  nh *= glitch + rnd;
  float r = texture(iChannel0, uv+vec2(nh, 0.08)*nh).r;
  float g = texture(iChannel0, uv+vec2(nh-0.07, 0.0)*nh).g;
  float b = texture(iChannel0, uv+vec2(nh, 0.0)*nh).b;

  vec3 col = vec3(r, g, b);
  gl_FragColor = vec4(col.rgb, 1.0);
}
`;

//----------------------------------
// Vertex Shader Code
//----------------------------------
const vertex = `
varying vec2 vUv;
void main()
{
    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
`;

/**
 * Glitch Shader
 */
export default class GlitchShader {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor(time = 0.0, texture) {
    this.uniforms = {
      iTime: { type: 'f', value: time },
      iChannel0: { type: 't', value: texture },
    };

    this.uniforms.iChannel0.value.wrapS = THREE.RepeatWrapping;
    this.uniforms.iChannel0.value.wrapT = THREE.RepeatWrapping;

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
    return this.uniforms.iTime.value;
  }

  set time(value) {
    this.uniforms.iTime.value = value;
  }
}
