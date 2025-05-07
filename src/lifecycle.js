import { createElementVNode, createTextVNode } from "./vnode";
import Watcher from "./observe/watcher";
import { patch } from "./vnode/patch";

export function initLifecycle(Vue) {
  // 将vnode 转为为真实DOM
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;

    // patch既有初始化的功能, 又有更新的功能
    vm.$el = patch(el, vnode);
  };

  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (val) {
    if (typeof val !== "object") return val;
    return JSON.stringify(val);
  };

  Vue.prototype._render = function (el) {
    const vm = this;

    return vm.$options.render.call(vm);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;

  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, true);
}

// 调用钩子
export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
