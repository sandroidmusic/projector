/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import { Group } from 'three';
import ParticleEvent from '@/components/particles/objects/ParticleEvent';

//----------------------------------
// Fragment Shader Code
//----------------------------------
const fragment = `
uniform sampler2D diffuseTexture;
varying vec4 vColor;
varying vec2 vRotation;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vRotation.x, vRotation.y, -vRotation.y, vRotation.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
}
`;

//----------------------------------
// Vertex Shader Code
//----------------------------------
const vertex = `
uniform float pointMultiplier;
attribute float size;
attribute vec4 colour;
attribute float rotation;

varying vec4 vColor;
varying vec2 vRotation;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (pointMultiplier / gl_Position.w);

  vRotation = vec2(cos(rotation), sin(rotation));
  vColor = colour;
}
`;
//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------

/**
 * Particle System Class
 */
export default class ParticleSystem extends Group {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor(texture = null) {
    super();

    this._texture = texture;
    this._geometry = null;
    this._material = null;

    this._particles = [];
    this._extHandlers = [];

    this._time = null;
    this._raf = null;

    this.createChildren();
  }

  //---------------------------------------------------
  //
  //  Public Properties
  //
  //---------------------------------------------------
  get particles() {
    return this._particles;
  }

  set particles(arr) {
    this._particles = arr;
  }

  get texture() {
    return this._texture;
  }

  set texture(texture) {
    this._texture = texture;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------

  //----------------------------------
  // Particle System Methods
  //----------------------------------
  start() {
    this._time = null;
    this._raf = requestAnimationFrame(this.renderParticles.bind(this));
  }

  stop() {
    cancelAnimationFrame(this._raf);
    this._raf = null;
    this._time = null;
  }

  reset() {
    this.stop();
    this._particles.forEach((p) => {
      p.reset();
    });
    this.visible = false;
  }

  addParticle(particle) {
    this._particles.push(particle);
  }

  addParticles(particles) {
    this._particles = this._particles.concat(particles);
  }

  removeParticles(particles) {
    particles.forEach((p) => {
      this.removeParticle(p);
    });
  }

  removeParticle(particle) {
    const index = this._particles.findIndex(p => p.id === particle.id);
    if (index) {
      this._particles.splice(index, 1);
    }
  }

  //----------------------------------
  // Event System Methods
  //----------------------------------
  on(event, listener) {
    const extHandlers = this._extHandlers;
    if (!extHandlers[event]) {
      extHandlers[event] = [];
    }
    extHandlers[event].push(listener);
  }

  off(event, listener = null) {
    const handlers = this._extHandlers[event] || [];
    if (listener) {
      const index = handlers.findIndex(handler => handler === listener);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    } else {
      this._extHandlers[event] = [];
    }
  }

  emit(event, data = null) {
    const handlers = this._extHandlers[event] || [];
    handlers.forEach((handler) => {
      handler({ type: event, ...data });
    });
  }

  //----------------------------------
  // Class specific Methods
  //----------------------------------

  destroy() {
    this.stop();
    this.clear();
    this._texture = null;
    this._material = null;
    this._geometry = null;
    this._particles = null;
    this._extHandlers = null;
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------
  /** @private */
  createChildren() {
    const uniforms = {
      diffuseTexture: {
        value: this.texture,
      },
      pointMultiplier: {
        value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0)),
      },
    };
    this._material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    this._geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
    this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
    this._geometry.setAttribute('rotation', new THREE.Float32BufferAttribute([], 1));

    const points = new THREE.Points(this._geometry, this._material);
    this.add(points);
  }

  /** @private */
  renderParticles() {
    if (this._raf !== null) {
      this._raf = requestAnimationFrame(this.renderParticles.bind(this));
      const updateHandlers = this._extHandlers[ParticleEvent.UPDATE] || [];
      const hasUpdateHandlers = updateHandlers.length > 0;

      const now = performance.now();
      const time = this._time || now;
      const particles = this._particles;

      particles.forEach((particle) => {
        const p = particle;
        if (p.progress < 1) {
          const progress = p.life / p.lifespan;
          p.progress = progress > 1 ? 1 : progress;

          if (hasUpdateHandlers) {
            updateHandlers.forEach((handler) => {
              handler({ type: ParticleEvent.UPDATE, p });
            });
          } else {
            this.updateParticle(p);
          }

          p.life += (now - time);
        } else if (!p.dead) {
          p.dead = true;
          this.emit(ParticleEvent.DEAD, p);
          const incompleteParticle = particles.find(part => !part.dead);
          if (!incompleteParticle) {
            this.emit(ParticleEvent.COMPLETE);
          }
        }
      });
      this._time = now;
      this.updateShader();
    }
  }

  /** @private */
  updateParticle(particle) {
    const p = particle;
    const x = p.position.x + (p.velocity * Math.cos(p.angle));
    const y = p.position.y + (p.velocity * Math.sin(p.angle));

    p.position.x = x;
    p.position.y = y + (p.gravity * p.progress);
    p.size *= p.growth;

    // const midpoint = 0.5;
    // p.alpha = (midpoint - Math.abs((p.progress % 1) - midpoint)) / midpoint;
    p.alpha = p.origin.alpha - p.progress;
    p.rotation += (0.010 * Math.cos(p.angle));
  }

  /** @private */
  updateShader() {
    const particles = this._particles;
    const geometry = this._geometry;
    const positions = [];
    const sizes = [];
    const colors = [];
    const rotations = [];

    particles.forEach((p) => {
      positions.push(p.position.x, p.position.y, p.position.z);
      sizes.push(p.size);
      const color = new THREE.Color(p.color);
      colors.push(color.r, color.g, color.b, p.alpha);
      rotations.push(p.rotation);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colors, 4));
    geometry.setAttribute('rotation', new THREE.Float32BufferAttribute(rotations, 1));
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.colour.needsUpdate = true;
    geometry.attributes.rotation.needsUpdate = true;

    if (!this.visible) {
      this.visible = true;
    }
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
}
