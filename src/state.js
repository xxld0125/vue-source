import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options; // 获取用户传递的选项
  if (opts.props) {
    initProps(vm, opts.props); // 初始化props
  }
  if (opts.data) {
    initData(vm, opts.data); // 初始化data
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
