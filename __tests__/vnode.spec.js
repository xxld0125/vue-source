import { describe, it, expect } from "vitest";
import { createElementVNode, createTextVNode } from "../src/vnode/index.js";

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
    });
  });

  it("创建没有data属性的元素节点", () => {
    const vm = {};
    const tag = "p";
    const child = "文本内容";

    const vnode = createElementVNode(vm, tag, null, child);

    expect(vnode).toEqual({
      vm,
      tag,
      key: undefined,
      data: null,
      children: [child],
      text: undefined,
    });
  });

  it("key为null或undefined时不应影响结果", () => {
    const vm = {};
    const tag = "div";

    // key为null的情况
    const data1 = { key: null, id: "test1" };
    const vnode1 = createElementVNode(vm, tag, data1);

    expect(vnode1.key).toBe(null);
    expect(vnode1.data.key).toBe(null);

    // key为undefined的情况
    const data2 = { key: undefined, id: "test2" };
    const vnode2 = createElementVNode(vm, tag, data2);

    expect(vnode2.key).toBe(undefined);
    expect(vnode2.data.key).toBe(undefined);
  });
});
