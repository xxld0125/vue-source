import { describe, it, expect, vi } from "vitest";
import { observe } from "../../src/observe/index.js";
import Vue from "../../src/index.js";

describe("响应式系统测试", () => {
  it("应该将一个普通对象转换为响应式对象", () => {
    const data = {
      name: "zhangsan",
      age: 20,
    };

    const observed = observe(data);

    // 验证__ob__属性存在且不可枚举
    expect(data.__ob__).toBeDefined();
    expect(Object.keys(data).includes("__ob__")).toBe(false);
    expect(data.__ob__).toBe(observed);
  });

  it("不应该对非对象类型添加响应式", () => {
    const number = 123;
    const string = "hello";
    const boolean = true;
    const nullValue = null;

    expect(observe(number)).toBeUndefined();
    expect(observe(string)).toBeUndefined();
    expect(observe(boolean)).toBeUndefined();
    expect(observe(nullValue)).toBeUndefined();
  });

  it("应该递归地将嵌套对象转换为响应式", () => {
    const data = {
      user: {
        name: "zhangsan",
        address: {
          city: "Beijing",
        },
      },
    };

    observe(data);

    // 验证各层对象是响应式的
    expect(data.__ob__).toBeDefined();
    expect(data.user.__ob__).toBeDefined();
    expect(data.user.address.__ob__).toBeDefined();
  });

  it("设置响应式对象的属性值时应保持响应式", () => {
    const data = {
      user: {
        name: "zhangsan",
      },
    };

    observe(data);

    // 修改属性为一个新对象
    data.user = { name: "lisi" };

    // 验证新对象也是响应式的
    expect(data.user.__ob__).toBeDefined();
  });

  it("响应式系统应该在Vue实例中正常工作", () => {
    const vm = new Vue({
      data: {
        message: "Hello",
        user: {
          name: "zhangsan",
        },
      },
    });

    // 验证data对象是响应式的
    expect(vm._data.__ob__).toBeDefined();
    expect(vm._data.user.__ob__).toBeDefined();

    // 通过代理访问并修改属性
    expect(vm.message).toBe("Hello");
    vm.message = "Updated";
    expect(vm._data.message).toBe("Updated");

    // 更新嵌套对象
    vm.user = { name: "lisi" };
    expect(vm._data.user.name).toBe("lisi");
    expect(vm.user.__ob__).toBeDefined();
  });
});
