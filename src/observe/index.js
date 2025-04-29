import arrayMethods from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // 给每个对象都增加收集功能
    this.dep = new Dep();

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

// 数组依赖收集
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

/*
 * 在Vue2响应式系统中存在两种依赖收集器:
 *
 * 1. 属性dep(let dep = new Dep())：
 *    - 作用范围：为对象的每个具体属性创建的依赖收集器
 *    - 创建时机：在defineReactive函数中，为每个属性单独创建
 *    - 作用对象：负责收集对该具体属性的依赖（谁用了这个属性）
 *    - 触发时机：当该属性的值发生变化时触发通知(dep.notify())
 *    - 存储位置：是一个局部变量，仅在闭包中存在
 *
 * 2. 对象dep(childOb.dep)：
 *    - 作用范围：为整个对象或数组创建的依赖收集器
 *    - 创建时机：在Observer构造函数中创建，通过observe(value)返回
 *    - 作用对象：负责收集对整个对象的依赖，特别是对数组或对象的操作
 *    - 触发时机：当对象/数组发生非属性访问的变化时触发（如数组方法push、pop等）
 *    - 存储位置：存储在Observer实例上，通过__ob__属性可以访问
 *
 * 这种双重依赖设计是Vue2响应式系统的核心，解决了JavaScript本身对象变化检测的局限性
 */
function defineReactive(target, key, value) {
  // 如果value是对象, 则递归劫持
  let childOb = observe(value); // 对所有对象都进行属性劫持, childOb用来收集依赖
  let dep = new Dep(); // 每个属性都有一个dep

  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 将当前的watcher添加到dep中 (收集属性依赖)
        if (childOb) {
          childOb.dep.depend(); // 将数组或对象的依赖添加到dep中 (收集对象/数组依赖)

          // 如果value是数组, 则需要收集数组的依赖
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      observe(newValue); // 如果newValue是对象, 则递归劫持
      value = newValue;
      dep.notify(); // 通知视图更新
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
