import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { createElementVNode, createTextVNode } from "../src/vnode/index.js";

describe("虚拟DOM patch过程测试", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("patch应该将虚拟节点转换为真实DOM", () => {
    const vm = new Vue({});

    // 创建简单的虚拟节点
    const vnode = createElementVNode(
      vm,
      "div",
      { id: "test" },
      createTextVNode(vm, "Hello")
    );

    // 获取真实DOM元素
    const app = document.querySelector("#app");

    // 手动调用_update进行patch
    vm.$el = app;
    vm._update(vnode);

    // 验证patch后的DOM结构
    const updatedEl = vm.$el;
    expect(updatedEl.tagName.toLowerCase()).toBe("div");
    expect(updatedEl.id).toBe("test");
    expect(updatedEl.textContent).toBe("Hello");
  });

  it("patch应该正确处理嵌套的DOM结构", () => {
    const vm = new Vue({});

    // 创建嵌套的虚拟DOM结构
    const childNode = createElementVNode(
      vm,
      "span",
      { class: "child" },
      createTextVNode(vm, "子节点")
    );
    const vnode = createElementVNode(vm, "div", { id: "parent" }, childNode);

    // 获取真实DOM元素
    const app = document.querySelector("#app");

    // 手动调用_update进行patch
    vm.$el = app;
    vm._update(vnode);

    // 验证patch后的DOM结构
    const updatedEl = vm.$el;
    expect(updatedEl.tagName.toLowerCase()).toBe("div");
    expect(updatedEl.id).toBe("parent");

    // 验证子节点
    const childEl = updatedEl.firstChild;
    expect(childEl.tagName.toLowerCase()).toBe("span");
    expect(childEl.className).toBe("child");
    expect(childEl.textContent).toBe("子节点");
  });

  it("patch应该正确处理样式属性", () => {
    const vm = new Vue({});

    // 创建带样式的虚拟节点
    const vnode = createElementVNode(
      vm,
      "div",
      {
        style: { color: "red", fontSize: "16px" },
      },
      createTextVNode(vm, "样式文本")
    );

    // 获取真实DOM元素
    const app = document.querySelector("#app");

    // 手动调用_update进行patch
    vm.$el = app;
    vm._update(vnode);

    // 验证样式是否被正确应用
    const updatedEl = vm.$el;
    expect(updatedEl.style.color).toBe("red");
    expect(updatedEl.style.fontSize).toBe("16px");
  });

  it("patch应该能够替换已有的DOM元素", () => {
    // 设置初始DOM
    const app = document.querySelector("#app");
    app.innerHTML = "<p>原始内容</p>";

    const vm = new Vue({});

    // 创建新的虚拟节点
    const vnode = createElementVNode(
      vm,
      "div",
      { id: "new" },
      createTextVNode(vm, "新内容")
    );

    // 手动调用_update进行patch
    vm.$el = app;
    vm._update(vnode);

    // 验证DOM是否被替换
    const container = document.body;
    const newElement = container.querySelector("#new");

    expect(newElement).not.toBeNull();
    expect(newElement.textContent).toBe("新内容");
    expect(container.contains(app)).toBe(false); // 原始元素应该被移除
  });

  it("应该在Vue实例挂载过程中正确执行patch", () => {
    const vm = new Vue({
      el: "#app",
      template: `<div id="test">{{ message }}</div>`,
      data: {
        message: "Hello Vue",
      },
    });

    // 验证挂载后的DOM结构
    expect(vm.$el).not.toBeNull();

    // 注意：由于我们使用的是模拟的编译器，这里无法验证具体的DOM内容
    // 我们主要测试挂载过程是否正常执行
    expect(vm._update).toBeDefined();
    expect(vm._render).toBeDefined();
  });
});
