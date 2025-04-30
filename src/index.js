import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";
import { initGlobalAPI } from "./globalAPI";
import Watcher from "./observe/watcher";

function Vue(options) {
  this._init(options);
}

Vue.prototype.$nextTick = nextTick;

initMixin(Vue); // 初始化混入
initLifecycle(Vue); // 初始化生命周期
initGlobalAPI(Vue); // 初始化全局API

Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
  const vm = this;
  options.user = true;
  new Watcher(vm, exprOrFn, options, cb, options);
};

export default Vue;
