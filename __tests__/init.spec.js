import { describe, it, expect } from "vitest";
import Vue from "../src/index.js";

describe("Vue初始化", () => {
  it("应该创建Vue实例并初始化选项", () => {
    const vm = new Vue({
      data: {
        message: "Hello Vue!",
      },
    });

    expect(vm).toBeInstanceOf(Vue);
    expect(vm.$options.data.message).toBe("Hello Vue!");
    expect(vm._data.message).toBe("Hello Vue!");

    // 验证代理功能
    expect(vm.message).toBe("Hello Vue!");

    // 修改代理属性并验证原始数据是否更新
    vm.message = "Updated message";
    expect(vm.message).toBe("Updated message");
    expect(vm._data.message).toBe("Updated message");
  });

  it("应该支持函数形式的data", () => {
    const vm = new Vue({
      data() {
        return {
          message: "Function data",
        };
      },
    });

    expect(vm.message).toBe("Function data");
    expect(vm._data.message).toBe("Function data");
  });
});
