import { describe, it, expect, vi } from "vitest";
import Vue from "../src/index.js";
import { compileToFunction } from "../src/compiler/index.js";

// 模拟compileToFunction函数
vi.mock("../src/compiler/index.js", () => ({
  compileToFunction: vi.fn(() => {
    // 返回一个模拟的render函数
    return function render() {
      return "rendered content";
    };
  }),
}));

describe("Vue挂载和模板编译测试", () => {
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("应该在调用$mount时编译模板", () => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
    });

    // 验证compileToFunction被调用
    expect(compileToFunction).toHaveBeenCalled();
  });

  it("应该优先使用options中的template作为模板", () => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app">原始内容</div>`;

    const template = `<div id="new-app">自定义模板</div>`;

    // 创建Vue实例，使用自定义模板
    const vm = new Vue({
      el: "#app",
      template: template,
    });

    // 验证自定义模板被传递给compileToFunction
    expect(compileToFunction).toHaveBeenCalledWith(template);
  });

  it("应该在没有template选项时使用el元素的outerHTML", () => {
    // 设置DOM环境
    const outerHTML = `<div id="app">外部HTML</div>`;
    document.body.innerHTML = outerHTML;

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
    });

    // 验证el元素的outerHTML被传递给compileToFunction
    expect(compileToFunction).toHaveBeenCalledWith(outerHTML);
  });

  it("应该将编译后的render函数添加到options中", () => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
    });

    // 验证render函数被设置到options中
    expect(typeof vm.$options.render).toBe("function");
  });

  it("手动调用$mount方法也应该能够正确编译模板", () => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;

    // 创建Vue实例，不直接指定el
    const vm = new Vue({
      template: `<div>手动挂载</div>`,
    });

    // 手动调用$mount
    vm.$mount("#app");

    // 验证compileToFunction被调用
    expect(compileToFunction).toHaveBeenCalled();
    // 验证render函数被设置
    expect(typeof vm.$options.render).toBe("function");
  });
});
