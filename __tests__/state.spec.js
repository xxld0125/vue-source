import { describe, it, expect } from "vitest";
import Vue from "../src/index.js";
import { initState } from "../src/state.js";

describe("状态初始化测试", () => {
  it("应该正确初始化data并代理属性", () => {
    const vm = {
      $options: {
        data: {
          message: "Hello",
          count: 0,
        },
      },
    };

    initState(vm);

    expect(vm._data).toBeDefined();
    expect(vm._data.message).toBe("Hello");

    // 验证属性代理
    expect(vm.message).toBe("Hello");

    // 修改属性
    vm.message = "Updated";
    expect(vm.message).toBe("Updated");
    expect(vm._data.message).toBe("Updated");
  });

  it("应该处理函数形式的data", () => {
    const vm = {
      $options: {
        data() {
          return {
            message: "Hello from function",
          };
        },
      },
    };

    initState(vm);

    expect(vm._data.message).toBe("Hello from function");
    expect(vm.message).toBe("Hello from function");
  });

  it("应该正确处理Vue实例的初始化状态", () => {
    const vm = new Vue({
      data: {
        message: "Hello Vue",
      },
    });

    expect(vm._data).toBeDefined();
    expect(vm.message).toBe("Hello Vue");
  });
});
