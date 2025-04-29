import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Watcher from "../../src/observe/watcher.js";
import Vue from "../../src/index.js";
import Dep, { pushTarget, popTarget } from "../../src/observe/dep.js";

describe("计算属性Watcher测试", () => {
  let vm;
  let computedWatcher;

  beforeEach(() => {
    // 创建一个简单的Vue实例作为测试上下文
    vm = new Vue({
      data: {
        count: 0,
        text: "hello",
      },
    });

    // 清理
    Dep.target = null;
  });

  afterEach(() => {
    // 清理
    Dep.target = null;
    vm = null;
    computedWatcher = null;
    vi.restoreAllMocks();
  });

  it("计算属性watcher应该被正确创建并初始化", () => {
    const getter = function () {
      return this.count * 2;
    };

    computedWatcher = new Watcher(vm, getter, { lazy: true });

    // 验证基本属性是否正确设置
    expect(computedWatcher.lazy).toBe(true);
    expect(computedWatcher.dirty).toBe(true);
    expect(computedWatcher.vm).toBe(vm);

    // lazy: true时不应立即求值
    expect(computedWatcher.value).toBeUndefined();
  });

  it("evaluate方法应该计算结果并清除dirty标记", () => {
    const getter = vi.fn(function () {
      return this.count + 10;
    });

    computedWatcher = new Watcher(vm, getter, { lazy: true });

    // 初始时dirty应该为true，value未定义
    expect(computedWatcher.dirty).toBe(true);
    expect(computedWatcher.value).toBeUndefined();
    expect(getter).not.toHaveBeenCalled();

    // 调用evaluate方法
    computedWatcher.evaluate();

    // 应该执行getter并缓存结果，同时清除dirty标记
    expect(getter).toHaveBeenCalledTimes(1);
    expect(computedWatcher.value).toBe(10); // count(0) + 10
    expect(computedWatcher.dirty).toBe(false);
  });

  it("update方法应该将计算属性watcher标记为脏", () => {
    computedWatcher = new Watcher(
      vm,
      function () {
        return this.count * 2;
      },
      { lazy: true }
    );

    // 首次求值
    computedWatcher.evaluate();
    expect(computedWatcher.value).toBe(0);
    expect(computedWatcher.dirty).toBe(false);

    // 调用update(模拟依赖变化)
    computedWatcher.update();

    // 应该将watcher标记为dirty，但不立即重新计算
    expect(computedWatcher.dirty).toBe(true);
    expect(computedWatcher.value).toBe(0); // 值保持不变，直到下次evaluate
  });

  it("depend方法应该让所有deps收集当前watcher", () => {
    // 创建计算属性watcher
    computedWatcher = new Watcher(
      vm,
      function () {
        return this.count + this.text;
      },
      { lazy: true }
    );

    // 计算初始值，让其收集依赖
    computedWatcher.evaluate();

    // 计算属性watcher应该有两个依赖项(count和text)
    expect(computedWatcher.deps.length).toBe(2);

    // 创建一个模拟渲染watcher
    const renderWatcher = {};
    Dep.target = renderWatcher;

    // 模拟每个dep的depend方法
    computedWatcher.deps.forEach((dep) => {
      dep.depend = vi.fn();
    });

    // 调用计算属性watcher的depend方法
    computedWatcher.depend();

    // 验证每个依赖都调用了depend方法
    computedWatcher.deps.forEach((dep) => {
      expect(dep.depend).toHaveBeenCalledTimes(1);
    });
  });

  it("get方法应该调用getter并返回结果", () => {
    const getter = vi.fn(function () {
      return this.count * 2;
    });

    computedWatcher = new Watcher(vm, getter, { lazy: true });

    // 清除初始化时的调用记录
    getter.mockClear();

    // 执行get方法
    const result = computedWatcher.get();

    // 验证getter在正确的上下文中调用
    expect(getter).toHaveBeenCalledTimes(1);
    expect(result).toBe(0); // count(0) * 2
  });
});
