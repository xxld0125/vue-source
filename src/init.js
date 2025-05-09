import { initState } from "./state";
import { compileToFunction } from "./compiler";
import { mountComponent, callHook } from "./lifecycle";
import { mergeOptions } from "./utils";

// 给Vue添加_init方法
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = mergeOptions(this.constructor.options, options); // 将用户传递的选项挂载到实例上

    callHook(vm, "beforeCreate"); // 调用beforeCreate钩子

    initState(vm); // 初始化状态

    callHook(vm, "created"); // 调用created钩子

    if (options.el) {
      vm.$mount(options.el); // 挂载组件
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let ops = vm.$options;

    if (!ops.render) {
      // 先查找有没有render函数
      let template;
      if (!ops.template && el) {
        // 没有render函数, 也没有template, 则将el的outerHTML作为template
        template = el.outerHTML;
      } else {
        template = ops.template;
      }

      // 有模版, 则将模版编译成render函数
      if (template) {
        const render = compileToFunction(template);
        ops.render = render;
      }
    }

    mountComponent(vm, el);
  };
}

/*
  Vue核心流程
  1.创造响应式数据
  2.模版转换成ast语法树
  3.将ast语法树转换成render函数
  4.执行render函数, 生成虚拟dom
  5.将虚拟dom转换成真实dom
*/
