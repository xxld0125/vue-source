import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Dep, { pushTarget, popTarget } from "../../src/observe/dep.js";
import Watcher from "../../src/observe/watcher.js";
import Vue from "../../src/index.js";

describe("Dep模块测试", () => {
  let vm;
  let mockWatcher1;
  let mockWatcher2;

  beforeEach(() => {
    // 创建Vue实例用于测试
    vm = new Vue({
      data: {
        message: "Hello",
      },
    });

    // 清空Dep.target
    Dep.target = null;

    // 模拟两个Watcher实例
    mockWatcher1 = new Watcher(vm, () => vm.message, {});
    mockWatcher2 = new Watcher(vm, () => vm.message + " World", {});
  });

  afterEach(() => {
    // 清理环境
    Dep.target = null;
  });

  it("Dep实例应该具有正确的初始状态", () => {
    const dep = new Dep();

    expect(dep.id).toBeDefined();
    expect(dep.subs).toEqual([]);
  });

  it("depend方法应该在Dep.target存在时将其添加到订阅列表", () => {
    const dep = new Dep();
    const mockWatcher = { addDep: () => {} };

    // 设置Dep.target
    Dep.target = mockWatcher;

    // 间谍mock addDep方法
    const addDepSpy = vi.spyOn(mockWatcher, "addDep");

    // 调用depend方法
    dep.depend();

    // 验证addDep被调用
    expect(addDepSpy).toHaveBeenCalledWith(dep);

    // 清理
    addDepSpy.mockRestore();
  });

  it("pushTarget方法应该设置当前watcher并添加到栈中", () => {
    // 初始状态下Dep.target可能为undefined
    Dep.target = null;
    expect(Dep.target).toBeNull();

    // 推入第一个watcher
    pushTarget(mockWatcher1);

    // 验证当前watcher是mockWatcher1
    expect(Dep.target).toBe(mockWatcher1);

    // 推入第二个watcher
    pushTarget(mockWatcher2);

    // 验证当前watcher变为mockWatcher2
    expect(Dep.target).toBe(mockWatcher2);
  });

  it("popTarget方法应该正确恢复栈中的上一个watcher", () => {
    // 首先清空所有现有的 watcher
    // 为了测试，我们将使用一个干净的环境
    const oldTarget = Dep.target;

    // 创建测试专用的 watcher 实例
    const testWatcher1 = { id: "test1" };
    const testWatcher2 = { id: "test2" };

    // 重置 Dep.target
    Dep.target = null;

    // 推入两个测试watcher
    pushTarget(testWatcher1);
    pushTarget(testWatcher2);

    // 当前watcher应该是testWatcher2
    expect(Dep.target).toBe(testWatcher2);

    // 弹出一个watcher
    popTarget();

    // 当前watcher应该恢复为testWatcher1
    expect(Dep.target).toBe(testWatcher1);

    // 弹出另一个watcher
    popTarget();

    // 还原原始环境
    Dep.target = oldTarget;
  });

  it("pushTarget和popTarget应该正确处理watcher嵌套", () => {
    // 保存原始的 Dep.target
    const oldTarget = Dep.target;

    // 创建测试专用的 watcher 实例
    const testWatcher1 = { id: "nest1" };
    const testWatcher2 = { id: "nest2" };

    // 重置 Dep.target
    Dep.target = null;

    // 模拟嵌套场景
    pushTarget(testWatcher1);
    expect(Dep.target).toBe(testWatcher1);

    // 嵌套调用
    pushTarget(testWatcher2);
    expect(Dep.target).toBe(testWatcher2);

    // 弹出内层
    popTarget();
    expect(Dep.target).toBe(testWatcher1);

    // 弹出外层
    popTarget();

    // 还原原始环境
    Dep.target = oldTarget;
  });
});
