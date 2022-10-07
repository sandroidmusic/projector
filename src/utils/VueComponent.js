//----------------------------------
// Imports
//----------------------------------
import { h, render } from 'vue';

//----------------------------------
// Private Variables
//----------------------------------
let appContext = null;

export default class VueComponent {
  //----------------------------------
  // Getter Setter
  //----------------------------------
  static set appContext(context) {
    appContext = context;
  }
  static get appContext() {
    return appContext;
  }

  //----------------------------------
  // Public Static Methods
  //----------------------------------
  /**
   * @param component
   * @param target
   * @param props
   * @returns {CombinedVueInstance<any & Vue, object, object, object, Record<never, any>>}
   */
  static create(component, target = document.body, props = null) {
    if (!appContext) {
      throw Error('appContext missing. Please provide main app context');
    }
    const div = document.createElement('div');
    target.appendChild(div);

    const instance = h(component, props);
    instance.appContext = appContext;
    render(instance, div);
    return instance.component.proxy;
  }

  static remove(vm) {
    const node = vm.$el.parentNode;
    render(null, node);
    node.parentNode.removeChild(node);
  }
}
