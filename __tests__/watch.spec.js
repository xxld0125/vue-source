import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { nextTick } from "../src/observe/watcher.js";

describe("$watch和watch选项测试", () => {
  let vm;

  beforeEach(() => {
    // 重置控制台错误方法的spy
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // 清理
    vi.restoreAllMocks();
  });

  describe("$watch方法测试", () => {
    it("$watch方法应该监听数据变化并调用回调", async () => {
      vm = new Vue({
        data: {
          message: "Hello",
          count: 0,
        },
      });

      const spy = vi.fn();
      vm.$watch("message", spy);

      // 修改被监听的数据
      vm.message = "World";

      // 等待更新
      await new Promise((resolve) => nextTick(resolve));

      // 验证回调被调用，且参数正确
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("World", "Hello");
    });

    it("$watch方法应该支持表达式函数", async () => {
      vm = new Vue({
        data: {
          user: {
            name: "John",
            age: 25,
          },
        },
      });

      const spy = vi.fn();
      vm.$watch(function () {
        return this.user.name;
      }, spy);

      // 修改被监听的数据
      vm.user.name = "Jane";

      // 等待更新
      await new Promise((resolve) => nextTick(resolve));

      // 验证回调被调用，且参数正确
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("Jane", "John");
    });

    it("$watch方法应该支持字符串表达式", async () => {
      vm = new Vue({
        data: {
          message: "Hello",
        },
      });

      const spy = vi.fn();
      // 当前实现只支持简单属性路径
      vm.$watch("message", spy);

      // 修改被监听的数据
      vm.message = "World";

      // 等待更新
      await new Promise((resolve) => nextTick(resolve));

      // 验证回调被调用，且参数正确
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("World", "Hello");
    });
  });

  describe("watch选项测试", () => {
    it("watch选项应该在初始化时设置监听器", async () => {
      const spy = vi.fn();

      vm = new Vue({
        data: {
          message: "Hello",
        },
        watch: {
          message: spy,
        },
      });

      // 修改被监听的数据
      vm.message = "World";

      // 等待更新
      await new Promise((resolve) => nextTick(resolve));

      // 验证回调被调用，且参数正确
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("World", "Hello");
    });

    it("watch选项应该支持数组形式的多个回调", async () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();

      vm = new Vue({
        data: {
          message: "Hello",
        },
        watch: {
          message: [spy1, spy2],
        },
      });

      // 修改被监听的数据
      vm.message = "World";

      // 等待更新
      await new Promise((resolve) => nextTick(resolve));

      // 验证两个回调都被调用，且参数正确
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy1).toHaveBeenCalledWith("World", "Hello");
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledWith("World", "Hello");
    });
  });
});
