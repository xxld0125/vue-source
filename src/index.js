import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { initGlobalAPI } from "./globalAPI";
import { initStateMixin } from "./state";

function Vue(options) {
  this._init(options);
}

initMixin(Vue); // 初始化混入
initLifecycle(Vue); // 实现了vm._update vm._render
initGlobalAPI(Vue); // 初始化全局API
initStateMixin(Vue); // 实现了$watch和$nextTick

export default Vue;
