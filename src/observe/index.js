import arrayMethods from "./array";

class Observer {
  constructor(data) {
    // 给data添加__ob__属性, 指向当前的Observer实例
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false, // 不可枚举
    });

    // Object.defineProperty 只能劫持已存在的属性,新增的属性不会劫持, 或者删除的属性也不会劫持, 需要额外处理($set, $delete)
    if (Array.isArray(data)) {
      data.__proto__ = arrayMethods;

      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }

  walk(data) {
    // 遍历对象, 对每个属性进行劫持
    Object.keys(data).forEach((key) => {
      // 重新定义属性为响应式
      defineReactive(data, key, data[key]);
    });
  }

  // 劫持数组
  observeArray(data) {
    // 遍历数组, 对每个元素进行劫持
    data.forEach((item) => {
      observe(item);
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
      observe(newValue); // 如果newValue是对象, 则递归劫持
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

  // 如果data已经被劫持过, 则直接返回
  if (data.__ob__ && data.__ob__ instanceof Observer) {
    return;
  }

  // 对对象进行劫持
  return new Observer(data);
}
