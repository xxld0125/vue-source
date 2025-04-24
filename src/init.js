import { initState } from "./state";
import { compileToFunction } from "./compiler";

// 给Vue添加_init方法
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options; // 将用户传递的选项挂载到实例上

    initState(vm); // 初始化状态

    if (options.el) {
      vm.$mount(options.el); //
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    if (!options.render) {
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
      }

      // 编译模版
      const render = compileToFunction(template);
      options.render = render;
    }
  };
}
