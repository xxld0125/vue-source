import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
  Vue.options = {
    _base: Vue, // 基础Vue
  }; // 全局选项

  // 作用: 将全局选项和组件选项合并
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
  };

  // 作用:
  // 1、可以手动创造组件进行挂载
  // 2.根据用户的参数, 返回一个子类构造, 并记录自己的选项
  Vue.extend = function (options) {
    // 创建子类
    function Sub(options = {}) {
      this._init(options); // 默认对子类进行初始化
    }

    Sub.prototype = Object.create(Vue.prototype); // 继承Vue
    Sub.prototype.constructor = Sub; // 指定构造函数

    Sub.options = mergeOptions(Vue.options, options); // 将用户传入的options和Vue.options进行合并

    return Sub;
  };

  Vue.options.components = {}; // 全局组件的注册

  // 作用:
  // 1.收集全局的定义, id 和 definition
  // 2.可以手动创造组件进行挂载
  Vue.component = function (id, definition) {
    // 如果definition是一个函数, 则直接使用, 否则使用Vue.extend
    definition =
      typeof definition === "function" ? definition : Vue.extend(definition);

    // 注册组件
    Vue.options.components[id] = definition;
  };
}
