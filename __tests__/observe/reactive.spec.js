import { describe, it, expect, vi } from "vitest";
import { observe } from "../../src/observe/index.js";
import Vue from "../../src/index.js";
import Dep from "../../src/observe/dep.js";
import Watcher from "../../src/observe/watcher.js";

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

  it("Dep应该能够收集和通知观察者", () => {
    // 创建一个响应式对象
    const data = { message: "Hello" };
    observe(data);

    // 创建一个模拟的watcher对象
    const watcher = {
      update: vi.fn(),
      addDep: function (dep) {
        dep.addSub(this);
      },
    };

    // 模拟Dep.target
    Dep.target = watcher;

    // 触发getter以收集依赖
    data.message;

    // 恢复Dep.target
    Dep.target = null;

    // 触发setter以通知依赖
    data.message = "Updated";

    // 验证watcher的update方法被调用
    expect(watcher.update).toHaveBeenCalled();
  });

  it("Watcher应该在依赖数据变化时触发更新", () => {
    // 创建一个简单的Vue实例
    const vm = new Vue({
      data: {
        message: "Hello",
      },
    });

    // 创建一个mock函数监控数据变化
    const fn = vi.fn(() => {
      return vm.message;
    });

    // 创建一个watcher
    const watcher = new Watcher(vm, fn, true);

    // 修改数据
    vm.message = "Updated";

    // 手动执行更新队列
    watcher.run();

    // 验证fn被再次调用
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
