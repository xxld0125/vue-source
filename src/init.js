import { initState } from "./state";

// 给Vue添加_init方法
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options; // 将用户传递的选项挂载到实例上

    initState(vm); // 初始化状态
  };
}
