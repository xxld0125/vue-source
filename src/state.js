import { observe } from "./observe/index";
import Watcher from "./observe/watcher";
import Dep from "./observe/dep";

export function initState(vm) {
  const opts = vm.$options; // 获取用户传递的选项
  if (opts.props) {
    initProps(vm); // 初始化props
  }
  if (opts.data) {
    initData(vm); // 初始化data
  }
  if (opts.computed) {
    initComputed(vm);
  }
}

function initProps(vm) {}

// 代理
function proxy(vm, key, source) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;

  data = vm._data = typeof data === "function" ? data.call(vm) : data; // 如果data是函数，则执行函数，否则直接赋值

  // 对数据进行劫持
  observe(data);

  // 代理
  for (let key in data) {
    proxy(vm, key, "_data");
  }
}

function initComputed(vm) {
  // 1. 获取computed的配置对象
  const computed = vm.$options.computed;

  const watchers = (vm._computedWatchers = {}); // 将计算属性watcher存入vm._computedWatchers

  // 2. 遍历computed的配置对象
  for (let key in computed) {
    const userDef = computed[key];

    const getter = typeof userDef === "function" ? userDef : userDef.get;

    // 设置lazy为true, 表示计算属性, 不要立即执行
    watchers[key] = new Watcher(vm, getter, { lazy: true });

    // 定义计算属性
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const getter = typeof userDef === "function" ? userDef : userDef.get;
  const setter = userDef.set || (() => {});

  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

// 计算属性根本不会收集依赖, 只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
  return function () {
    // 获取计算属性watcher
    const watcher = this._computedWatchers[key];

    if (watcher.dirty) {
      watcher.evaluate();
    }

    // 计算属性watcher出栈后, 应该让计算属性watcher里面的属性也去收集上一层的渲染watcher
    if (Dep.target) {
      watcher.depend();
    }

    return watcher.value;
  };
}
