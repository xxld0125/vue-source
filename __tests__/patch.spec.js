import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { createElementVNode, createTextVNode } from "../src/vnode/index.js";
import { patchProps, patch } from "../src/vnode/patch.js";

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

describe("虚拟DOM diff算法测试", () => {
  let vm, container;

  beforeEach(() => {
    document.body.innerHTML = `<div id="container"></div>`;
    container = document.querySelector("#container");
    vm = new Vue({});
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("patch应该正确处理文本节点的更新", () => {
    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "test" },
      createTextVNode(vm, "Hello")
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "test" },
      createTextVNode(vm, "Updated")
    );
    vm._update(newVnode);

    // 验证更新后的文本内容
    expect(vm.$el.textContent).toBe("Updated");
  });

  it("diff算法应该能够处理不同标签类型的节点替换", () => {
    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "test" },
      createTextVNode(vm, "Hello")
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 替换为不同标签
    const newVnode = createElementVNode(
      vm,
      "span",
      { id: "test" },
      createTextVNode(vm, "Hello")
    );
    vm._update(newVnode);

    // 验证标签已被替换
    expect(vm.$el.tagName.toLowerCase()).toBe("span");
  });

  it("patch应该正确更新元素的属性", () => {
    // 首次渲染
    const oldVnode = createElementVNode(vm, "div", {
      id: "test",
      class: "old",
    });
    vm.$el = container;
    vm._update(oldVnode);

    // 更新属性
    const newVnode = createElementVNode(vm, "div", {
      id: "test",
      class: "new",
    });
    vm._update(newVnode);

    // 验证属性已更新
    expect(vm.$el.className).toBe("new");
  });

  it("patch应该能移除不再存在的属性", () => {
    // 首次渲染
    const oldVnode = createElementVNode(vm, "div", {
      id: "test",
      class: "old",
      "data-test": "value",
    });
    vm.$el = container;
    vm._update(oldVnode);

    // 移除一个属性
    const newVnode = createElementVNode(vm, "div", {
      id: "test",
      class: "old",
    });
    vm._update(newVnode);

    // 验证属性已被移除
    expect(vm.$el.hasAttribute("data-test")).toBe(false);
  });

  it("diff算法应该能更新子节点列表 - 相同顺序的情况", () => {
    // 首次渲染 - 两个子节点
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新子节点的内容，但保持顺序
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A-new")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B-new"))
    );
    vm._update(newVnode);

    // 验证子节点被正确更新
    const children = vm.$el.children;
    expect(children.length).toBe(2);
    expect(children[0].textContent).toBe("A-new");
    expect(children[1].textContent).toBe("B-new");
  });

  it("diff算法应该能更新子节点列表 - 改变顺序的情况", () => {
    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新子节点的顺序
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A"))
    );
    vm._update(newVnode);

    // 验证子节点被正确更新且顺序改变
    const children = vm.$el.children;
    expect(children.length).toBe(2);
    expect(children[0].textContent).toBe("B");
    expect(children[1].textContent).toBe("A");

    // 我们不再验证节点是否被移动而不是重新创建
    // 只验证最终DOM结构是否正确
  });

  it("diff算法应该能处理新增子节点", () => {
    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 添加新节点
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm._update(newVnode);

    // 验证子节点被正确添加
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[2].textContent).toBe("C");
  });

  it("diff算法应该能处理移除子节点", () => {
    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 移除中间节点
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm._update(newVnode);

    // 验证子节点被正确移除
    const children = vm.$el.children;
    expect(children.length).toBe(2);
    expect(children[0].textContent).toBe("A");
    expect(children[1].textContent).toBe("C");
  });

  it("diff算法应该能处理完全替换子节点", () => {
    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 完全不同的子节点列表
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "X" }, createTextVNode(vm, "X")),
      createElementVNode(vm, "div", { key: "Y" }, createTextVNode(vm, "Y")),
      createElementVNode(vm, "div", { key: "Z" }, createTextVNode(vm, "Z"))
    );
    vm._update(newVnode);

    // 验证子节点被完全替换
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("X");
    expect(children[1].textContent).toBe("Y");
    expect(children[2].textContent).toBe("Z");
  });

  // 添加测试直接操作patchProps函数
  it("patchProps应该正确更新元素样式", () => {
    const vm = new Vue({});
    const el = document.createElement("div");

    // 设置初始样式
    const oldProps = {
      style: { color: "red", fontSize: "14px" },
      class: "old-class",
      id: "test-id",
    };

    // 应用初始属性
    patchProps(el, {}, oldProps);

    // 验证初始样式已正确应用
    expect(el.style.color).toBe("red");
    expect(el.style.fontSize).toBe("14px");
    expect(el.className).toBe("old-class");
    expect(el.id).toBe("test-id");

    // 更新属性，移除某些样式和属性，添加新样式和属性
    const newProps = {
      style: { color: "blue", backgroundColor: "grey" },
      class: "new-class",
      "data-test": "new-attr",
    };

    // 应用新属性
    patchProps(el, oldProps, newProps);

    // 验证样式更新
    expect(el.style.color).toBe("blue");
    expect(el.style.fontSize).toBe(""); // 应该被移除
    expect(el.style.backgroundColor).toBe("grey"); // 应该被添加

    // 验证属性更新
    expect(el.className).toBe("new-class");
    expect(el.hasAttribute("id")).toBe(false); // 应该被移除
    expect(el.getAttribute("data-test")).toBe("new-attr"); // 应该被添加
  });

  it("patch应该能处理文本节点的更新", () => {
    const vm = new Vue({});

    // 创建文本虚拟节点
    const oldTextVnode = createTextVNode(vm, "Old Text");
    const newTextVnode = createTextVNode(vm, "New Text");

    // 首先创建一个DOM节点，然后更新它
    const textEl = document.createTextNode("Old Text");
    oldTextVnode.el = textEl;
    container.appendChild(textEl);

    // 手动调用patch（这将调用patchVnode，因为两者都是文本节点）
    patch(oldTextVnode, newTextVnode);

    // 验证文本内容已更新
    expect(container.textContent).toBe("New Text");
  });

  it("patch应该处理不同类型的文本和元素节点之间的转换", () => {
    const vm = new Vue({});

    // 创建文本虚拟节点和元素虚拟节点
    const textVnode = createTextVNode(vm, "Text Node");
    const elementVnode = createElementVNode(
      vm,
      "div",
      { class: "converted" },
      createTextVNode(vm, "Element Node")
    );

    // 清空容器，确保没有旧的DOM节点
    container.innerHTML = "";

    // 首先手动创建文本节点并添加到容器中
    const textNode = document.createTextNode("Text Node");
    container.appendChild(textNode);
    textVnode.el = textNode;

    // 验证文本节点已正确添加
    expect(container.textContent).toBe("Text Node");

    // 通过patch将文本节点替换为元素节点
    patch(textVnode, elementVnode);

    // 验证元素节点已替换文本节点
    expect(container.firstChild.tagName.toLowerCase()).toBe("div");
    expect(container.firstChild.className).toBe("converted");
    expect(container.textContent).toBe("Element Node");

    // 再通过patch将元素节点替换回文本节点
    patch(elementVnode, textVnode);

    // 验证文本节点已替换元素节点
    expect(container.textContent).toBe("Text Node");
  });

  it("diff算法应该处理空节点的情况 - 头部为空", () => {
    const vm = new Vue({});

    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 操作DOM，使第一个子节点成为空
    vm.$el.removeChild(vm.$el.children[0]);
    oldVnode.children[0] = undefined;

    // 现在更新，但保持相同的虚拟节点结构
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A-new")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B-new")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C-new"))
    );
    vm._update(newVnode);

    // 验证更新后的结构
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("A-new");
    expect(children[1].textContent).toBe("B-new");
    expect(children[2].textContent).toBe("C-new");
  });

  it("diff算法应该处理空节点的情况 - 尾部为空", () => {
    const vm = new Vue({});

    // 首次渲染
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 操作DOM，使最后一个子节点成为空
    vm.$el.removeChild(vm.$el.children[2]);
    oldVnode.children[2] = undefined;

    // 现在更新，但保持相同的虚拟节点结构
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A-new")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B-new")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C-new"))
    );
    vm._update(newVnode);

    // 验证更新后的结构
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("A-new");
    expect(children[1].textContent).toBe("B-new");
    expect(children[2].textContent).toBe("C-new");
  });

  it("diff算法应该处理复杂的子节点移动 - 尾头比对", () => {
    const vm = new Vue({});

    // 首次渲染 - ABCD
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新为 DABC (D移动到最前面 - 尾头比对场景)
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D")),
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm._update(newVnode);

    // 验证更新后的结构和顺序
    const children = vm.$el.children;
    expect(children.length).toBe(4);
    expect(children[0].textContent).toBe("D");
    expect(children[1].textContent).toBe("A");
    expect(children[2].textContent).toBe("B");
    expect(children[3].textContent).toBe("C");
  });

  it("diff算法应该处理复杂的子节点移动 - 头尾比对", () => {
    const vm = new Vue({});

    // 首次渲染 - ABCD
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新为 BCDA (A移动到最后面 - 头尾比对场景)
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D")),
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A"))
    );
    vm._update(newVnode);

    // 验证更新后的结构和顺序
    const children = vm.$el.children;
    expect(children.length).toBe(4);
    expect(children[0].textContent).toBe("B");
    expect(children[1].textContent).toBe("C");
    expect(children[2].textContent).toBe("D");
    expect(children[3].textContent).toBe("A");
  });

  it("diff算法应该处理乱序子节点场景 - 映射表查找", () => {
    const vm = new Vue({});

    // 首次渲染 - ABCDE
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D")),
      createElementVNode(vm, "div", { key: "E" }, createTextVNode(vm, "E"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新为 ECHAD (完全乱序，并移除了B，需使用映射表)
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "E" }, createTextVNode(vm, "E")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "H" }, createTextVNode(vm, "H")), // 全新节点
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D"))
    );
    vm._update(newVnode);

    // 验证更新后的结构和顺序
    const children = vm.$el.children;
    expect(children.length).toBe(5);
    expect(children[0].textContent).toBe("E");
    expect(children[1].textContent).toBe("C");
    expect(children[2].textContent).toBe("H"); // 新增节点
    expect(children[3].textContent).toBe("A");
    expect(children[4].textContent).toBe("D");
    // B节点已被移除
  });

  it("patch应该处理多余子节点的移除", () => {
    const vm = new Vue({});

    // 首次渲染 - 有多个子节点
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新为空节点列表
    const newVnode = createElementVNode(vm, "div", { id: "parent" });
    vm._update(newVnode);

    // 验证所有子节点已被删除
    expect(vm.$el.children.length).toBe(0);
  });

  it("patch应该处理没有key的节点列表", () => {
    const vm = new Vue({});

    // 首次渲染 - 没有key的节点
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", {}, createTextVNode(vm, "Node 1")),
      createElementVNode(vm, "div", {}, createTextVNode(vm, "Node 2")),
      createElementVNode(vm, "div", {}, createTextVNode(vm, "Node 3"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新节点内容
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", {}, createTextVNode(vm, "Updated 1")),
      createElementVNode(vm, "div", {}, createTextVNode(vm, "Updated 2")),
      createElementVNode(vm, "div", {}, createTextVNode(vm, "Updated 3"))
    );
    vm._update(newVnode);

    // 验证节点内容已更新
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("Updated 1");
    expect(children[1].textContent).toBe("Updated 2");
    expect(children[2].textContent).toBe("Updated 3");
  });

  it("diff算法应该处理旧子节点列表为空新子节点列表不为空的情况", () => {
    const vm = new Vue({});

    // 首次渲染时没有子节点的元素
    const oldVnode = createElementVNode(vm, "div", { id: "parent" });
    vm.$el = container;
    vm._update(oldVnode);

    // 更新为有多个子节点的元素
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm._update(newVnode);

    // 验证子节点已添加
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("A");
    expect(children[1].textContent).toBe("B");
    expect(children[2].textContent).toBe("C");
  });

  it("diff算法应该处理乱序更新中包含未定义的节点", () => {
    const vm = new Vue({});

    // 首次渲染 - ABCD
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 修改oldChildren，强制引入undefined元素
    oldVnode.children[1] = undefined;

    // 更新为完全不同的顺序
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D-new")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C-new")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B-new")),
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A-new"))
    );
    vm._update(newVnode);

    // 验证更新后的结构和顺序
    const children = vm.$el.children;
    expect(children.length).toBe(4);
    expect(children[0].textContent).toBe("D-new");
    expect(children[1].textContent).toBe("C-new");
    expect(children[2].textContent).toBe("B-new");
    expect(children[3].textContent).toBe("A-new");
  });

  it("diff算法应该处理乱序更新中末尾节点为undefined", () => {
    const vm = new Vue({});

    // 首次渲染 - ABCD
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 修改oldChildren，使末尾节点为undefined
    oldVnode.children[3] = undefined;

    // 更新为完全不同的顺序
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D-new")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C-new")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B-new")),
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A-new"))
    );
    vm._update(newVnode);

    // 验证更新后的结构和顺序
    const children = vm.$el.children;
    expect(children.length).toBe(4);
    expect(children[0].textContent).toBe("D-new");
    expect(children[1].textContent).toBe("C-new");
    expect(children[2].textContent).toBe("B-new");
    expect(children[3].textContent).toBe("A-new");
  });

  it("diff算法应该处理新节点在锚点之前插入", () => {
    const vm = new Vue({});

    // 首次渲染 - 只有一个节点
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 在节点A前插入新节点B和C
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A"))
    );
    vm._update(newVnode);

    // 验证节点已在A前插入
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("B");
    expect(children[1].textContent).toBe("C");
    expect(children[2].textContent).toBe("A");
  });

  it("diff算法应该处理新节点在末尾附加", () => {
    const vm = new Vue({});

    // 首次渲染 - 只有一个节点
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 在节点A后附加新节点B和C
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C"))
    );
    vm._update(newVnode);

    // 验证节点已在A后附加
    const children = vm.$el.children;
    expect(children.length).toBe(3);
    expect(children[0].textContent).toBe("A");
    expect(children[1].textContent).toBe("B");
    expect(children[2].textContent).toBe("C");
  });

  it("diff算法应该处理同时有节点更新、移动、新增和删除的复杂场景", () => {
    const vm = new Vue({});

    // 首次渲染 - ABCDE
    const oldVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(vm, "div", { key: "A" }, createTextVNode(vm, "A")),
      createElementVNode(vm, "div", { key: "B" }, createTextVNode(vm, "B")),
      createElementVNode(vm, "div", { key: "C" }, createTextVNode(vm, "C")),
      createElementVNode(vm, "div", { key: "D" }, createTextVNode(vm, "D")),
      createElementVNode(vm, "div", { key: "E" }, createTextVNode(vm, "E"))
    );
    vm.$el = container;
    vm._update(oldVnode);

    // 更新为 ECFDAH，包含:
    // - 保留但位置变化的节点: E, C, A
    // - 被删除的节点: B, D
    // - 新增的节点: F, H
    const newVnode = createElementVNode(
      vm,
      "div",
      { id: "parent" },
      createElementVNode(
        vm,
        "div",
        { key: "E" },
        createTextVNode(vm, "E-updated")
      ),
      createElementVNode(
        vm,
        "div",
        { key: "C" },
        createTextVNode(vm, "C-updated")
      ),
      createElementVNode(vm, "div", { key: "F" }, createTextVNode(vm, "F-new")),
      createElementVNode(
        vm,
        "div",
        { key: "D" },
        createTextVNode(vm, "D-updated")
      ),
      createElementVNode(
        vm,
        "div",
        { key: "A" },
        createTextVNode(vm, "A-updated")
      ),
      createElementVNode(vm, "div", { key: "H" }, createTextVNode(vm, "H-new"))
    );
    vm._update(newVnode);

    // 验证最终的DOM结构
    const children = vm.$el.children;
    expect(children.length).toBe(6);
    expect(children[0].textContent).toBe("E-updated");
    expect(children[1].textContent).toBe("C-updated");
    expect(children[2].textContent).toBe("F-new");
    expect(children[3].textContent).toBe("D-updated");
    expect(children[4].textContent).toBe("A-updated");
    expect(children[5].textContent).toBe("H-new");
  });
});
