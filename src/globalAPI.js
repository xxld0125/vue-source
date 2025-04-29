import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
  Vue.options = {}; // 全局选项

  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin); // 将全局选项和组件选项合并
  };
}
