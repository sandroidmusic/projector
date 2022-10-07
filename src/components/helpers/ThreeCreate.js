/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';

//----------------------------------
// Type Definitions
//----------------------------------
/**
 * @typedef {Object} CreateOptions
 * @property {Vector3Like} [size]           Vector3 like object
 * @property {Vector3Like} [position]       Vector3 like object
 * @property {THREE.Material} [material]    a valid THREE.js Material
 * @property {Boolean} [cloneMaterial]      if true will clone the passed material
 * @property {*} [color]                    a color for the material
 * @property {Boolean} [outline]            render as outline
 * @property {Number} [radius]              radius for circular primitives
 * @property {Number} [segments]            segments for circular primitives
 * @property {Vector2Like} [grid]           Vector2 like object
 * @property {Vector2Like} [gap]            Vector2 like object
 */

/**
 * @typedef {Object} Vector3Like
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */

/**
 * @typedef {Object} Vector2Like
 * @property {Number} x
 * @property {Number} y
 */

/**
 * Static Three Object Creation Helper Class
 */
export default class ThreeCreate {
  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  // TODO: https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_shapes.html
  //----------------------------------
  // Primitives
  //----------------------------------

  /**
   * Creates a regular Plane
   * @param {CreateOptions} options
   * @returns {THREE.Mesh|THREE.LineSegments}
   */
  static plane(options) {
    const { size, position, material, color, outline } = {
      size: { x: 1, y: 1, z: 1 },
      position: { x: 0, y: 0, z: 0 },
      material: null,
      color: 0xffffff,
      outline: false,
      ...options,
    };

    let obj;
    const objGeo = new THREE.PlaneGeometry();

    if (outline) {
      const objEdges = new THREE.EdgesGeometry(objGeo);
      obj = new THREE.LineSegments(objEdges, material || new THREE.LineBasicMaterial({ color }));
    } else {
      obj = new THREE.Mesh(objGeo, material || new THREE.MeshBasicMaterial({ wireframe: false, map: null, color }));
    }
    obj.userData.size = size;
    obj.position.set(position.x, position.y, position.z);
    obj.scale.set(size.x, size.y, size.z);
    return obj;
  }

  /**
   * Creates a rounded Plane
   * @param {CreateOptions} options
   * @returns {THREE.Mesh|THREE.LineSegments}
   */
  static roundedPlane(options) {
    const { size, radius, position, material, color, outline } = {
      position: { x: 0, y: 0, z: 0 },
      size: { x: 1, y: 1, z: 1 },
      material: null,
      color: 0xffffff,
      outline: false,
      radius: 0.125,
      ...options,
    };

    const objShape = new THREE.Shape();
    const width = 1;
    const height = 1;
    const x = (0) - (width / 2);
    const y = (0) - (height / 2);

    objShape.moveTo(x, y + radius);
    objShape.lineTo(x, y + height - radius);
    objShape.quadraticCurveTo(x, y + height, x + radius, y + height);
    objShape.lineTo(x + width - radius, y + height);
    objShape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    objShape.lineTo(x + width, y + radius);
    objShape.quadraticCurveTo(x + width, y, x + width - radius, y);
    objShape.lineTo(x + radius, y);
    objShape.quadraticCurveTo(x, y, x, y + radius);

    let obj;
    const objBuffer = new THREE.ShapeGeometry(objShape);

    if (outline) {
      const objEdges = new THREE.EdgesGeometry(objBuffer);
      obj = new THREE.LineSegments(objEdges, material || new THREE.LineBasicMaterial({ color }));
    } else {
      obj = new THREE.Mesh(objBuffer, material || new THREE.MeshBasicMaterial({ wireframe: false, map: null, color }));
    }
    obj.userData.size = size;
    obj.position.set(position.x, position.y, position.z);
    obj.scale.set(size.x, size.y, size.z);
    return obj;
  }

  /**
   * Creates a Circle
   * @param {CreateOptions} options
   * @returns {THREE.Mesh|THREE.LineSegments}
   */
  static circle(options) {
    const { size, radius, segments, position, material, color, outline } = {
      size: { x: 1, y: 1, z: 1 },
      position: { x: 0, y: 0, z: 0 },
      material: null,
      color: 0xffffff,
      outline: false,
      radius: 1,
      segments: 16,
      ...options,
    };
    let obj;
    const objGeo = new THREE.CircleGeometry(radius, segments);

    if (outline) {
      const objEdges = new THREE.EdgesGeometry(objGeo);
      obj = new THREE.LineSegments(objEdges, material || new THREE.LineBasicMaterial({ color }));
    } else {
      obj = new THREE.Mesh(objGeo, material || new THREE.MeshBasicMaterial({ wireframe: false, map: null, color }));
    }
    obj.userData.size = size;
    obj.position.set(position.x, position.y, position.z);
    obj.scale.set(size.x, size.y, size.z);
    return obj;
  }

  //----------------------------------
  // Helpers
  //----------------------------------

  /**
   * Creates a grid of Objects
   * @param {CreateOptions} options
   * @returns {*[THREE.Object3D]}
   */
  static grid(options) {
    const { func, size, radius, position, grid, gap, material, cloneMaterial, color, outline } = {
      size: { x: 1, y: 1, z: 1 },
      position: { x: 0, y: 0, z: 0 },
      grid: { x: 0, y: 0 },
      gap: { x: 0, y: 0 },
      material: null,
      cloneMaterial: false,
      outline: null,
      radius: null,
      color: 0xffffff,
      ...options,
    };

    const width = ((grid.x * size.x) + ((grid.x - 1) * gap.x));
    const height = ((grid.y * size.y) + ((grid.y - 1) * gap.y));
    position.x = -((width / 2) - (size.x / 2));
    position.y = (height / 2) - (size.y / 2);

    const xPos = position.x;
    let yPos = position.y;
    const objects = [];
    for (let y = 0; y < grid.y; y += 1) {
      let posX = xPos;
      for (let x = 0; x < grid.x; x += 1) {
        const obj = func({
          size,
          material: cloneMaterial && material ? material.clone() : material,
          position: { x: posX, y: yPos, z: 1 },
          outline,
          radius,
          color,
        });
        objects.push(obj);
        posX += (size.x + gap.x);
      }
      yPos -= (size.y + gap.y);
    }
    return objects;
  }
}
