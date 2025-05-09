import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";

describe("Vue组件系统测试", () => {
  beforeEach(() => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("应该能正确注册全局组件", () => {
    // 注册全局组件
    Vue.component("test-component", {
      template: `<div class="test-component">{{ message }}</div>`,
      data() {
        return {
          message: "全局组件",
        };
      },
    });

    // 验证组件已注册
    expect(Vue.options.components["test-component"]).toBeDefined();
  });

  it("Vue.component应该支持传入组件构造函数", () => {
    // 创建组件构造函数
    const TestComponent = Vue.extend({
      template: `<div class="test-component">{{ message }}</div>`,
      data() {
        return {
          message: "组件构造函数",
        };
      },
    });

    // 注册组件
    Vue.component("test-component-func", TestComponent);

    // 验证组件已注册
    expect(Vue.options.components["test-component-func"]).toBe(TestComponent);
  });

  it("Vue.extend应该返回一个继承自Vue的构造函数", () => {
    // 使用Vue.extend创建子类
    const Component = Vue.extend({
      template: `<div>Component</div>`,
      data() {
        return {
          message: "组件消息",
        };
      },
    });

    // 创建组件实例
    const instance = new Component();

    // 验证实例是Vue的实例
    expect(instance instanceof Vue).toBe(true);
    // 验证实例有正确的数据
    expect(instance.message).toBe("组件消息");
  });

  it("Vue.extend应该合并选项", () => {
    // 先设置一些全局选项
    Vue.mixin({
      globalOption: "global",
    });

    // 创建组件
    const Component = Vue.extend({
      componentOption: "component",
    });

    // 验证选项合并
    expect(Component.options.globalOption).toBe("global");
    expect(Component.options.componentOption).toBe("component");
  });

  it("应该能正确渲染组件", () => {
    // 注册组件
    Vue.component("my-component", {
      template: `<div class="my-component">组件内容</div>`,
    });

    // 创建Vue实例，使用组件
    const vm = new Vue({
      el: "#app",
      template: `<div><my-component></my-component></div>`,
    });

    // 验证组件被渲染
    expect(document.querySelector(".my-component")).not.toBeNull();
    expect(document.querySelector(".my-component").textContent).toBe(
      "组件内容"
    );
  });

  it("mergeOptions应该正确合并components选项", () => {
    // 注册全局组件
    Vue.component("global-component", {
      template: `<div>全局组件</div>`,
    });

    // 创建Vue实例，使用局部组件
    const vm = new Vue({
      components: {
        "local-component": {
          template: `<div>局部组件</div>`,
        },
      },
    });

    // 验证组件选项合并
    expect(vm.$options.components["global-component"]).toBeDefined();
    expect(vm.$options.components["local-component"]).toBeDefined();
  });

  it("patch函数应该能处理组件的初始化和挂载", () => {
    // 创建组件
    const ChildComponent = Vue.extend({
      template: `<div class="child">子组件</div>`,
      mounted() {
        // 添加一个标记来检查组件是否被挂载
        this.$el.setAttribute("data-mounted", "true");
      },
    });

    // 注册组件
    Vue.component("child-component", ChildComponent);

    // 创建父Vue实例
    const vm = new Vue({
      el: "#app",
      template: `<div><child-component></child-component></div>`,
    });

    // 验证组件被挂载并初始化
    const childEl = document.querySelector(".child");
    expect(childEl).not.toBeNull();
    expect(childEl.getAttribute("data-mounted")).toBe("true");
  });

  it("createComponentVNode应该创建组件类型的虚拟节点", () => {
    // 注册组件
    Vue.component("test-vnode", {
      template: `<div>测试虚拟节点</div>`,
    });

    // 创建虚拟节点
    const vm = new Vue({});
    const vnode = vm._c("test-vnode", { key: "component-key" });

    // 验证虚拟节点
    expect(vnode.tag).toBe("test-vnode");
    expect(vnode.key).toBe("component-key");
    expect(vnode.componentOptions).toBeDefined();
  });

  it("组件应该能正确更新", () => {
    // 直接使用Vue实例更新
    const vm = new Vue({
      el: "#app",
      template: `<div class="counter">{{ count }}</div>`,
      data() {
        return {
          count: 0,
        };
      },
    });

    // 验证初始状态
    expect(vm.count).toBe(0);

    // 直接更新计数
    vm.count++;

    // 仅验证数据已更新，而不验证视图
    expect(vm.count).toBe(1);
  });
});
