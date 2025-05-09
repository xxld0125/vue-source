import { describe, it, expect } from "vitest";
import {
  createElementVNode,
  createTextVNode,
  isSameVnode,
} from "../src/vnode/index.js";
import Vue from "../src/index.js";

describe("虚拟节点系统测试", () => {
  it("createElementVNode应该创建正确的元素节点", () => {
    const vm = {};
    const tag = "div";
    const data = { id: "app", class: "container" };
    const children = ["child1", "child2"];

    const vnode = createElementVNode(vm, tag, data, ...children);

    expect(vnode).toEqual({
      vm,
      tag,
      key: undefined,
      data,
      children,
      text: undefined,
      componentOptions: undefined,
    });
  });

  it("createElementVNode应该正确处理key属性", () => {
    const vm = {};
    const tag = "div";
    const data = { key: "test-key", id: "app" };

    const vnode = createElementVNode(vm, tag, data);

    expect(vnode.key).toBe("test-key");
    expect(vnode.data.key).toBeUndefined(); // key应该被移除
  });

  it("createTextVNode应该创建正确的文本节点", () => {
    const vm = {};
    const text = "这是一段文本";

    const vnode = createTextVNode(vm, text);

    expect(vnode).toEqual({
      vm,
      tag: undefined,
      key: undefined,
      data: undefined,
      children: undefined,
      text,
      componentOptions: undefined,
    });
  });

  it("应该能创建复杂的嵌套虚拟DOM结构", () => {
    const vm = {};

    // 创建子节点
    const child1 = createTextVNode(vm, "子节点1");
    const child2 = createElementVNode(
      vm,
      "span",
      { class: "highlight" },
      createTextVNode(vm, "嵌套文本")
    );

    // 创建父节点
    const parent = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      child1,
      child2
    );

    // 验证结构
    expect(parent.tag).toBe("div");
    expect(parent.data.id).toBe("parent");
    expect(parent.children).toHaveLength(2);

    // 验证第一个子节点
    expect(parent.children[0].text).toBe("子节点1");

    // 验证第二个子节点
    expect(parent.children[1].tag).toBe("span");
    expect(parent.children[1].data.class).toBe("highlight");
    expect(parent.children[1].children).toHaveLength(1);
    expect(parent.children[1].children[0].text).toBe("嵌套文本");
  });

  it("创建没有子节点的元素节点", () => {
    const vm = {};
    const tag = "div";
    const data = { id: "empty" };

    const vnode = createElementVNode(vm, tag, data);

    expect(vnode).toEqual({
      vm,
      tag,
      key: undefined,
      data,
      children: [],
      text: undefined,
      componentOptions: undefined,
    });
  });

  it("创建没有data属性的元素节点", () => {
    const vm = {};
    const tag = "p";
    const child = "文本内容";

    // 传递null或undefined作为data
    const vnode = createElementVNode(vm, tag, undefined, child);

    // 只验证必要的属性
    expect(vnode.vm).toBe(vm);
    expect(vnode.tag).toBe(tag);
    expect(vnode.children).toContain(child);
  });

  it("应该处理不同类型的data参数", () => {
    const vm = {};
    const tag = "div";

    // data为null的情况
    const vnode1 = createElementVNode(vm, tag, null);
    expect(vnode1.tag).toBe(tag);
    expect(vnode1.vm).toBe(vm);

    // data为undefined的情况
    const vnode2 = createElementVNode(vm, tag, undefined);
    expect(vnode2.tag).toBe(tag);
    expect(vnode2.vm).toBe(vm);
  });

  it("应该处理字符串形式的key属性", () => {
    const vm = {};
    const tag = "div";
    const data = { key: "test-key", id: "test1" };

    const vnode = createElementVNode(vm, tag, data);
    expect(vnode.key).toBe("test-key");

    // 不检查data.key是否被删除，因为实现可能有所不同
  });

  it("isSameVnode应该正确比较两个虚拟节点是否相同", () => {
    const vm = {};

    // 创建一些测试用的虚拟节点
    const node1 = createElementVNode(vm, "div", { key: "test" });
    const node2 = createElementVNode(vm, "div", { key: "test" });
    const node3 = createElementVNode(vm, "div", { key: "different" });
    const node4 = createElementVNode(vm, "span", { key: "test" });
    const node5 = createElementVNode(vm, "div"); // 没有key
    const node6 = createElementVNode(vm, "div"); // 没有key

    // 相同标签和key的节点应该被认为是相同的
    expect(isSameVnode(node1, node2)).toBe(true);

    // 相同标签但不同key的节点应该被认为是不同的
    expect(isSameVnode(node1, node3)).toBe(false);

    // 不同标签但相同key的节点应该被认为是不同的
    expect(isSameVnode(node1, node4)).toBe(false);

    // 相同标签且都没有key的节点应该被认为是相同的
    expect(isSameVnode(node5, node6)).toBe(true);

    // 一个有key一个没有key的节点应该被认为是不同的
    expect(isSameVnode(node1, node5)).toBe(false);
  });

  // 添加针对组件虚拟节点的测试
  it("应该能创建组件类型的虚拟节点", () => {
    // 创建Vue实例
    const vm = new Vue({
      components: {
        "custom-component": {
          template: "<div>Custom Component</div>",
        },
      },
    });

    // 创建组件虚拟节点
    const vnode = vm._c("custom-component", { id: "test-component" });

    // 验证组件虚拟节点
    expect(vnode.tag).toBe("custom-component");
    expect(vnode.data.id).toBe("test-component");
    expect(vnode.componentOptions).toBeDefined();
    expect(vnode.componentOptions.Ctor).toBeDefined();
  });

  it("应该正确处理组件hook", () => {
    // 注册全局组件
    Vue.component("test-hook", {
      template: "<div>Test Hook</div>",
    });

    // 创建Vue实例
    const vm = new Vue({});

    // 创建组件虚拟节点
    const vnode = vm._c("test-hook");

    // 验证组件hook
    expect(vnode.data.hook).toBeDefined();
    expect(typeof vnode.data.hook.init).toBe("function");
  });

  it("组件虚拟节点应该包含正确的构造函数", () => {
    // 创建组件构造函数
    const Component = Vue.extend({
      template: "<div>Component</div>",
    });

    // 注册组件
    Vue.component("test-constructor", Component);

    // 创建Vue实例
    const vm = new Vue({});

    // 创建组件虚拟节点
    const vnode = vm._c("test-constructor");

    // 验证组件构造函数
    expect(vnode.componentOptions.Ctor).toBe(Component);
  });
});
