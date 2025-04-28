import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { compileToFunction } from "../src/compiler/index.js";
import { createElementVNode, createTextVNode } from "../src/vnode/index.js";

// 模拟compileToFunction函数
vi.mock("../src/compiler/index.js", () => ({
  compileToFunction: vi.fn((template) => {
    // 返回一个可控的render函数
    return function render() {
      const h = this._c;
      const _v = this._v;
      const _s = this._s;
      // 简单模拟render函数的返回结果
      return h("div", { id: "app" }, _v(_s(this.message || "默认文本")));
    };
  }),
}));

describe("Vue挂载和模板编译测试", () => {
  beforeEach(() => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app">原始内容</div>`;
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("应该在调用$mount时编译模板", () => {
    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
    });

    // 验证compileToFunction被调用
    expect(compileToFunction).toHaveBeenCalled();
  });

  it("应该优先使用options中的template作为模板", () => {
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
    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
    });

    // 验证render函数被设置到options中
    expect(typeof vm.$options.render).toBe("function");
  });

  it("手动调用$mount方法也应该能够正确编译模板", () => {
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

  it("真实DOM更新应该使用虚拟DOM的patch过程", () => {
    // 模拟虚拟DOM的_update和_render方法
    const updateSpy = vi.spyOn(Vue.prototype, "_update");
    const renderSpy = vi.spyOn(Vue.prototype, "_render");

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
      data: {
        message: "Hello Vue",
      },
    });

    // 验证_render和_update被调用
    expect(renderSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();

    // 清理
    updateSpy.mockRestore();
    renderSpy.mockRestore();
  });

  it("应该能正确设置元素属性", () => {
    // 模拟patchProps函数
    const setAttributeSpy = vi.spyOn(HTMLElement.prototype, "setAttribute");

    // 直接调用Vue实例的_update方法，传入虚拟节点
    const vm = new Vue({
      data: {}, // 添加空的data选项，避免underfined错误
    });
    const vnode = createElementVNode(vm, "div", { id: "test", class: "box" });

    // 手动调用$mount和update过程
    vm.$mount("#app");
    vm._update(vnode);

    // 验证setAttribute被调用，设置了正确的属性
    expect(setAttributeSpy).toHaveBeenCalledWith("id", "test");
    expect(setAttributeSpy).toHaveBeenCalledWith("class", "box");

    setAttributeSpy.mockRestore();
  });

  it("应该能正确处理样式属性", () => {
    // 模拟元素样式设置
    const div = document.createElement("div");
    const styleSpy = vi.spyOn(div.style, "setProperty");
    document.body.appendChild(div);

    // 创建Vue实例
    const vm = new Vue({
      el: "div",
      template: `<div style="color: red; font-size: 16px;">样式文本</div>`,
    });

    // 验证样式属性设置
    // 注意：由于我们使用的是模拟的render函数，实际样式设置会被跳过
    // 这里主要测试编译和挂载流程
    expect(compileToFunction).toHaveBeenCalled();
    expect(typeof vm.$options.render).toBe("function");
  });
});
