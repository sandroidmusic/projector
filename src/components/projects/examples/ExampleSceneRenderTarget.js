/* eslint-disable no-underscore-dangle,class-methods-use-this */
//----------------------------------
// Imports
//----------------------------------
import * as THREE from 'three';
import AbstractScene from '@/components/controllers/scene/objects/AbstractScene.js';
import Projector from '@/components/controllers/Projector.js';
import Tween from '@/components/helpers/Tween.js';
import Random from '@/utils/Random.js';

//----------------------------------
// Constants
//----------------------------------

//----------------------------------
// Private Variables
//----------------------------------
let tween;
let renderMaterial;
let iid;
const triangles = [];

/**
 * Example Scene - How to use render targets
 */
export default class ExampleSceneRenderTarget extends AbstractScene {
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
  play() {
    Projector.globals.tracker.body.fill.material = renderMaterial;
    iid = setInterval(() => {
      this.animate();
    }, 250);
  }

  stop() {
    tween.killAll();
    clearInterval(iid);
    iid = null;
    Projector.globals.tracker.resetMaterials();
  }

  async setup() {
    const { width: sceneWidth, height: sceneHeight } = Projector.globals.tracker;
    const { scene, post } = Projector.createRenderObject('shader', sceneWidth, sceneHeight);

    const shape = new THREE.Shape();
    const length = 5;
    const height = length * Math.sqrt(3) / 2;
    shape.moveTo(-length, height);
    shape.lineTo(length, height);
    shape.lineTo(0, -height);
    shape.lineTo(-length, height);

    const extrudeSettings = {
      steps: 1,
      depth: 200,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    const gridX = 14;
    const gridY = 10;
    const xInc = 10;
    const yInc = 11;
    let posX;
    let posY = ((yInc * gridY) / 2);
    for (let y = 0; y < gridY; y += 1) {
      posX = -((xInc * gridX) / 2);
      for (let x = 0; x < gridX; x += 1) {
        const obj = mesh.clone();
        obj.position.x = posX;
        obj.position.y = posY;
        obj.position.z = -200;
        obj.material = material.clone();
        obj.rotation.z = (x % 2 === 0) ? THREE.MathUtils.DEG2RAD * 180 : 0;
        scene.add(obj);
        triangles.push(obj);
        posX += xInc;
      }
      posY -= yInc;
    }

    const spotLight = new THREE.SpotLight(0xFFFFFF, 1);
    spotLight.position.set(0, 0, 200);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 1;
    spotLight.distance = 200;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 0;
    spotLight.shadow.camera.far = 300;
    spotLight.shadow.focus = 1;
    scene.add(spotLight);
    scene.position.y = -30;
    scene.position.x = 4;
    scene.scale.set(1.4, 1.4, 1);
    scene.rotation.x = THREE.MathUtils.DEG2RAD * -25;

    tween = new Tween();
    renderMaterial = new THREE.MeshBasicMaterial({ map: post.savePass.renderTarget.texture });
  }

  destroy() {
  }

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Animation / Render Handlers
  //
  //---------------------------------------------------
  animate() {
    const red = new THREE.Color(0xFF0000);
    const white = new THREE.Color(0xFFFFFF);
    const triangle = triangles[Random.int.minmax(0, triangles.length - 1)];
    tween.fromTo(
      triangle.position,
      { z: -100 },
      { z: -175, duration: 1, ease: 'power1.easeout' },
    );
    tween.fromTo(
      triangle.material.color,
      { r: red.r, g: red.g, b: red.b },
      { r: white.r, g: white.g, b: white.b, duration: 1, ease: 'none' },
    );
  }
}
