import { describe, it, expect } from "vitest";
import Vue from "../src/index.js";

describe("Vue构造函数测试", () => {
  it("Vue应该是一个函数并可以创建实例", () => {
    expect(typeof Vue).toBe("function");
    const vm = new Vue({});
    expect(vm).toBeInstanceOf(Vue);
    expect(typeof vm._init).toBe("function");
  });

  it("应该正确处理各种选项类型", () => {
    const vm1 = new Vue({
      data: { a: 1 },
    });
    expect(vm1.a).toBe(1);

    const vm2 = new Vue({
      data() {
        return { b: 2 };
      },
    });
    expect(vm2.b).toBe(2);

    const vm3 = new Vue({
      props: ["prop1", "prop2"],
    });
    expect(vm3.$options.props).toEqual(["prop1", "prop2"]);
  });
});
