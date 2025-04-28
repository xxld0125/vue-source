import { describe, it, expect, vi } from "vitest";
import { observe } from "../../src/observe/index.js";
import Vue from "../../src/index.js";

describe("数组响应式测试", () => {
  it("应该重写数组方法并保持原有功能", () => {
    const arr = [1, 2, 3];
    observe(arr);

    // 测试push方法
    arr.push(4);
    expect(arr).toEqual([1, 2, 3, 4]);

    // 测试pop方法
    const popped = arr.pop();
    expect(popped).toBe(4);
    expect(arr).toEqual([1, 2, 3]);

    // 测试splice方法
    const spliced = arr.splice(1, 1, "a");
    expect(spliced).toEqual([2]);
    expect(arr).toEqual([1, "a", 3]);

    // 测试shift方法
    const shifted = arr.shift();
    expect(shifted).toBe(1);
    expect(arr).toEqual(["a", 3]);

    // 测试unshift方法
    arr.unshift("b");
    expect(arr).toEqual(["b", "a", 3]);

    // 测试sort方法
    arr.sort();
    expect(arr).toEqual([3, "a", "b"]);

    // 测试reverse方法
    arr.reverse();
    expect(arr).toEqual(["b", "a", 3]);
  });

  it("应该使数组中新增的对象元素也是响应式的", () => {
    const arr = [];
    observe(arr);

    // 通过push添加对象
    arr.push({ name: "obj1" });
    expect(arr[0].__ob__).toBeDefined();

    // 通过splice添加对象
    arr.splice(1, 0, { name: "obj2" });
    expect(arr[1].__ob__).toBeDefined();

    // 通过unshift添加对象
    arr.unshift({ name: "obj3" });
    expect(arr[0].__ob__).toBeDefined();
    expect(arr[0].name).toBe("obj3");
  });

  it("数组响应式系统应该在Vue实例中正常工作", () => {
    const vm = new Vue({
      data: {
        items: [{ id: 1 }, { id: 2 }],
        nestedArray: [[{ id: 1 }]],
      },
    });

    // 验证数组及其元素是响应式的
    expect(vm.items.__ob__).toBeDefined();
    expect(vm.items[0].__ob__).toBeDefined();

    // 添加新元素
    vm.items.push({ id: 3 });
    expect(vm.items.length).toBe(3);
    expect(vm.items[2].__ob__).toBeDefined();

    // 验证嵌套数组也是响应式的
    expect(vm.nestedArray.__ob__).toBeDefined();
    expect(vm.nestedArray[0].__ob__).toBeDefined();
    expect(vm.nestedArray[0][0].__ob__).toBeDefined();
  });

  it("数组原始方法不应该被影响", () => {
    // 保存原始数组方法
    const originalPush = Array.prototype.push;

    const arr = [1, 2];
    observe(arr);

    // 创建新数组，不应该被观察者修改
    const normalArr = [3, 4];

    // 调用push方法
    normalArr.push(5);

    // 验证原始方法未被修改
    expect(Array.prototype.push).toBe(originalPush);
    expect(normalArr).toEqual([3, 4, 5]);
  });
});
