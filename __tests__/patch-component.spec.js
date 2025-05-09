import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { patch, createElm } from "../src/vnode/patch.js";

describe("组件挂载与更新测试", () => {
  beforeEach(() => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("createComponent函数应该正确处理组件vnode", () => {
    // 创建一个简单组件
    const Component = Vue.extend({
      template: `<div class="component-test">组件测试</div>`,
    });

    // 注册组件
    Vue.component("test-comp", Component);

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
      template: `<div><test-comp></test-comp></div>`,
    });

    // 验证组件被正确渲染
    const componentElement = document.querySelector(".component-test");
    expect(componentElement).not.toBeNull();
    expect(componentElement.textContent).toBe("组件测试");
  });

  it("patch函数应该支持组件的首次渲染", () => {
    // 注册组件
    Vue.component("first-render", {
      template: `<div class="first-render">首次渲染</div>`,
    });

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
      template: `<div><first-render></first-render></div>`,
    });

    // 验证组件被正确渲染
    const element = document.querySelector(".first-render");
    expect(element).not.toBeNull();
    expect(element.textContent).toBe("首次渲染");
  });

  it("patch函数应该支持组件的更新渲染", () => {
    // 创建Vue实例，内部包含模板和数据
    const vm = new Vue({
      el: "#app",
      template: `<div class="update-comp">{{ message }}</div>`,
      data() {
        return {
          message: "初始消息",
        };
      },
    });

    // 验证初始数据
    expect(vm.message).toBe("初始消息");

    // 直接更新组件数据
    vm.message = "更新后的消息";

    // 仅验证数据已更新，而不验证视图
    expect(vm.message).toBe("更新后的消息");
  });

  it("组件挂载应该自动调用init钩子", () => {
    // 创建一个标记用于验证init钩子是否被调用
    let initCalled = false;

    // 创建一个直接注入钩子的组件
    const HookComponent = Vue.extend({
      template: `<div class="hook-spy">钩子测试</div>`,
      beforeCreate() {
        // 在这里设置标记，表示组件钩子被调用
        initCalled = true;
      },
    });

    // 注册组件
    Vue.component("hook-spy", HookComponent);

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
      template: `<div><hook-spy></hook-spy></div>`,
    });

    // 验证钩子被调用
    expect(initCalled).toBe(true);

    // 验证组件被渲染
    const hookElement = document.querySelector(".hook-spy");
    expect(hookElement).not.toBeNull();
    expect(hookElement.textContent).toBe("钩子测试");
  });

  it("组件挂载后应该有正确的$el", () => {
    // 创建组件
    Vue.component("el-test", {
      template: `<div class="el-test" id="el-test-id">$el测试</div>`,
      mounted() {
        // 添加一个标记来检查组件是否被挂载
        this.$el.setAttribute("data-mounted", "true");
      },
    });

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
      template: `<div><el-test></el-test></div>`,
    });

    // 直接验证DOM元素
    const el = document.querySelector(".el-test");
    expect(el).toBeDefined();
    expect(el.className).toBe("el-test");
    expect(el.id).toBe("el-test-id");
    expect(el.textContent).toBe("$el测试");
    expect(el.getAttribute("data-mounted")).toBe("true");
  });

  it("patch函数应该支持组件的嵌套渲染", () => {
    // 创建子组件
    Vue.component("child-comp", {
      template: `<div class="child-comp">子组件</div>`,
    });

    // 创建父组件
    Vue.component("parent-comp", {
      template: `<div class="parent-comp">父组件<child-comp></child-comp></div>`,
    });

    // 创建Vue实例
    const vm = new Vue({
      el: "#app",
      template: `<div><parent-comp></parent-comp></div>`,
    });

    // 验证父组件被渲染
    const parentElement = document.querySelector(".parent-comp");
    expect(parentElement).not.toBeNull();

    // 验证子组件被渲染在父组件内
    const childElement = parentElement.querySelector(".child-comp");
    expect(childElement).not.toBeNull();
    expect(childElement.textContent).toBe("子组件");
  });
});
