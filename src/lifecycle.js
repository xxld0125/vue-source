export function mountComponent(vm, el) {
  vm.$el = el;
}

export function initLifecycle(Vue) {
  Vue.prototype._update = function (el) {};
  Vue.prototype._render = function (el) {};
}
