class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持已存在的属性,新增的属性不会劫持, 或者删除的属性也不会劫持, 需要额外处理($set, $delete)

    this.walk(data);
  }

  walk(data) {
    // 遍历对象, 对每个属性进行劫持
    Object.keys(data).forEach((key) => {
      // 重新定义属性为响应式
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(target, key, value) {
  // 如果value是对象, 则递归劫持
  observe(value);
  Object.defineProperty(target, key, {
    get() {
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      value = newValue;
    },
  });
}

// 对这个对象进行劫持
export function observe(data) {
  // 判断data是否是对象
  if (typeof data !== "object" || data === null) {
    return;
  }

  // 对对象进行劫持
  return new Observer(data);
}
