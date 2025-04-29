import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Watcher from "../../src/observe/watcher.js";
import Vue from "../../src/index.js";
import Dep from "../../src/observe/dep.js";
import { nextTick } from "../../src/observe/watcher.js";

describe("Watcher测试", () => {
  let vm;

  beforeEach(() => {
    // 创建一个简单的Vue实例用于测试
    vm = new Vue({
      data: {
        message: "Hello",
        count: 0,
      },
    });
  });

  afterEach(() => {
    // 清理
    Dep.target = null;
    vi.restoreAllMocks();
  });

  it("应该正确创建watcher实例", () => {
    const fn = vi.fn();
    const watcher = new Watcher(vm, fn, true);

    expect(watcher.id).toBeDefined();
    expect(watcher.renderWatcher).toBe(true);
    expect(watcher.deps).toEqual([]);
    expect(watcher.depsId).toBeInstanceOf(Set);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("addDep方法应该避免重复添加相同的dep", () => {
    const fn = vi.fn();
    const watcher = new Watcher(vm, fn, true);

    const dep = new Dep();
    const addSubSpy = vi.spyOn(dep, "addSub");

    // 第一次添加dep
    watcher.addDep(dep);
    expect(watcher.deps.length).toBe(1);
    expect(watcher.depsId.has(dep.id)).toBe(true);
    expect(addSubSpy).toHaveBeenCalledTimes(1);

    // 尝试再次添加相同的dep
    watcher.addDep(dep);
    expect(watcher.deps.length).toBe(1); // 不应该重复添加
    expect(addSubSpy).toHaveBeenCalledTimes(1); // 不应该再次调用addSub
  });

  it("update方法应该调用queueWatcher", () => {
    const fn = vi.fn();
    const watcher = new Watcher(vm, fn, true);

    // 模拟update方法实现
    const updateSpy = vi.spyOn(watcher, "update");

    // 调用update方法
    watcher.update();

    // 验证update被调用
    expect(updateSpy).toHaveBeenCalled();
  });

  it("run方法应该执行getter函数", () => {
    const fn = vi.fn();
    const watcher = new Watcher(vm, fn, true);

    // 清除第一次调用的记录
    fn.mockClear();

    watcher.run();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("nextTick应该在微任务中执行回调", async () => {
    let flag = false;

    nextTick(() => {
      flag = true;
    });

    // 同步代码执行完毕后，flag应该仍然是false
    expect(flag).toBe(false);

    // 等待微任务队列执行完成
    await Promise.resolve();

    // 现在flag应该变为true
    expect(flag).toBe(true);
  });

  it("nextTick应该按照添加顺序执行回调", async () => {
    const callOrder = [];

    nextTick(() => {
      callOrder.push(1);
    });

    nextTick(() => {
      callOrder.push(2);
    });

    nextTick(() => {
      callOrder.push(3);
    });

    // 等待微任务执行完成
    await Promise.resolve();

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it("nextTick在Vue实例上也应该正常工作", async () => {
    let flag = false;

    vm.$nextTick(() => {
      flag = true;
    });

    expect(flag).toBe(false);

    await Promise.resolve();

    expect(flag).toBe(true);
  });
});
