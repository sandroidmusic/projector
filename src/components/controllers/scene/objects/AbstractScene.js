/* eslint-disable class-methods-use-this,no-empty-function,no-unused-vars */
//----------------------------------
// Imports
//----------------------------------

//----------------------------------
// Private Vars
//----------------------------------
let uid = 0;

/**
 * Abstract Scene Class.
 * All Scenes should extend from this class
 * @abstract
 */
export default class AbstractScene {
  //---------------------------------------------------
  //
  //  Constructor
  //
  //---------------------------------------------------
  constructor() {
    uid += 1;
    /**
     * Classname of the Scene
     * @type {string}
     */
    this.name = this.constructor.name;
    /**
     * Identifier for the Scene Instance
     * @type {string}
     */
    this.id = `${this.name}${uid}`;
    /**
     * Indicates if the Scene is currently playing or not.
     * Has to be implemented by a Scene for it to return a valid value.
     * @default null
     * @type {boolean|null}
     */
    this.playing = null;

    let parameter = null;
    /**
     * Scene parameter value.
     * Can be set manually or will change based on MidiEvent.SCENE_VALUE if Scene was set up via SceneController
     * @type {Number}
     */
    Object.defineProperty(this, 'parameter', {
      get() { return parameter; },
      set(value) {
        this.handleParameterChange(value, parameter === value);
        parameter = value;
      },
    });

    /** @private */
    this.rraf = null;
  }

  //---------------------------------------------------
  //
  //  Public Methods
  //
  //---------------------------------------------------
  /**
   * Play / activate the scene
   * @abstract
   */
  play() {}

  /**
   * Stop / deactivate the scene
   * @abstract
   */
  stop() {}

  /**
   * Create / prepare all elements of the scene
   * @async
   * @abstract
   */
  async setup() {}

  /**
   * Set the scene parameter value.
   * @param {Number} value
   */
  setParameter(value) {
    this.parameter = value;
  }

  /**
   * Destroy the scene instance and all of its elements
   * @abstract
   */
  destroy() {}

  //---------------------------------------------------
  //
  //  Private Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Render / Animation Methods
  //
  //---------------------------------------------------
  /**
   * If you require a render loop, you can start it here.
   * Uses requestAnimationFrame
   * @param {Function} renderFunction
   */
  startRender(renderFunction) {
    const func = renderFunction.bind(this);
    const render = () => {
      if (this.rraf !== null) {
        this.rraf = requestAnimationFrame(render);
      }
      func();
    };
    this.rraf = requestAnimationFrame(render);
  }

  /**
   * Stops a previously started render loop
   */
  stopRender() {
    cancelAnimationFrame(this.rraf);
    this.rraf = null;
  }

  //---------------------------------------------------
  //
  //  Event Handlers
  //
  //---------------------------------------------------
  /**
   * Called whenever the Scene parameter gets updated
   * @param {Number} value
   * @param {Boolean} retriggered
   */
  handleParameterChange(value, retriggered = false) {
  }
}
