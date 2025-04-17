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

function initData(vm) {
  let data = vm.$options.data;

  data = vm._data = typeof data === "function" ? data.call(vm) : data; // 如果data是函数，则执行函数，否则直接赋值
}
