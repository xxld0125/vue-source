import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import Dep from "../src/observe/dep.js";

describe("计算属性功能测试", () => {
  let vm;

  beforeEach(() => {
    // 每个测试前清理Dep.target
    Dep.target = null;
  });

  afterEach(() => {
    // 清理
    vm = null;
    Dep.target = null;
    vi.restoreAllMocks();
  });

  it("计算属性应该被正确初始化", () => {
    vm = new Vue({
      data: {
        firstName: "John",
        lastName: "Doe",
      },
      computed: {
        fullName() {
          return this.firstName + " " + this.lastName;
        },
      },
    });

    // 检查是否创建了_computedWatchers
    expect(vm._computedWatchers).toBeDefined();
    expect(vm._computedWatchers.fullName).toBeDefined();

    // 检查计算属性是否可以访问
    expect(vm.fullName).toBe("John Doe");
  });

  it("计算属性应该缓存计算结果", () => {
    const getterSpy = vi.fn(function () {
      return this.firstName + " " + this.lastName;
    });

    vm = new Vue({
      data: {
        firstName: "John",
        lastName: "Doe",
      },
      computed: {
        fullName: getterSpy,
      },
    });

    // 首次访问，执行getter
    expect(vm.fullName).toBe("John Doe");
    expect(getterSpy).toHaveBeenCalledTimes(1);

    // 再次访问，不应该重新计算
    expect(vm.fullName).toBe("John Doe");
    expect(getterSpy).toHaveBeenCalledTimes(1);
  });

  it("当依赖的数据变化时，计算属性应该设置dirty标记", () => {
    vm = new Vue({
      data: {
        firstName: "John",
        lastName: "Doe",
      },
      computed: {
        fullName() {
          return this.firstName + " " + this.lastName;
        },
      },
    });

    // 首次访问
    expect(vm.fullName).toBe("John Doe");

    // 修改其中一个依赖
    vm.firstName = "Jane";

    // 检查watcher的dirty标记
    expect(vm._computedWatchers.fullName.dirty).toBe(true);

    // 再次访问，应该重新计算
    expect(vm.fullName).toBe("Jane Doe");

    // 计算后dirty应该重置为false
    expect(vm._computedWatchers.fullName.dirty).toBe(false);
  });

  it("使用get/set定义的计算属性应该支持setter", () => {
    vm = new Vue({
      data: {
        firstName: "John",
        lastName: "Doe",
      },
      computed: {
        fullName: {
          get() {
            return this.firstName + " " + this.lastName;
          },
          set(newValue) {
            const parts = newValue.split(" ");
            this.firstName = parts[0];
            this.lastName = parts[1];
          },
        },
      },
    });

    // 初始值
    expect(vm.fullName).toBe("John Doe");

    // 通过setter修改
    vm.fullName = "Jane Smith";

    // 验证数据属性被正确更新
    expect(vm.firstName).toBe("Jane");
    expect(vm.lastName).toBe("Smith");
    expect(vm.fullName).toBe("Jane Smith");
  });

  it("计算属性应该收集渲染watcher作为依赖", async () => {
    // 创建一个存根的渲染函数
    const renderFn = vi.fn(function () {
      return this.fullName; // 触发计算属性的getter
    });

    vm = new Vue({
      data: {
        firstName: "John",
        lastName: "Doe",
      },
      computed: {
        fullName() {
          return this.firstName + " " + this.lastName;
        },
      },
    });

    // 模拟一个渲染watcher
    vm.$options.render = renderFn;
    vm._update = vi.fn();
    vm._render = renderFn;
    vm.$mount();

    // 初始渲染应该调用计算属性
    expect(renderFn).toHaveBeenCalled();

    // 修改依赖属性
    vm.firstName = "Jane";

    // 等待异步更新队列执行
    await Promise.resolve();

    // 验证渲染函数被再次调用
    expect(renderFn.mock.calls.length).toBeGreaterThan(1);
  });
});
