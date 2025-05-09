import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { initGlobalAPI } from "../src/globalAPI.js";

describe("Vue全局API测试", () => {
  it("应该拥有正确的全局选项", () => {
    // 验证基础全局选项
    expect(Vue.options).toBeDefined();
    expect(Vue.options._base).toBe(Vue);
    expect(Vue.options.components).toBeDefined();
  });

  it("Vue.mixin应该正确合并选项", () => {
    // 保存原始options
    const originalOptions = { ...Vue.options };

    // 使用mixin
    Vue.mixin({ testOption: "test value" });

    // 验证选项已合并
    expect(Vue.options.testOption).toBe("test value");

    // 还原options (为了不影响其他测试)
    Vue.options = originalOptions;
  });

  it("Vue.extend应该返回Vue子类", () => {
    // 使用extend创建子类
    const SubComponent = Vue.extend({
      template: "<div>子组件</div>",
      data() {
        return { message: "Hello" };
      },
    });

    // 验证子类属性
    expect(SubComponent.options.template).toBe("<div>子组件</div>");
    expect(SubComponent.prototype instanceof Vue).toBe(true);

    // 创建子类实例
    const instance = new SubComponent();

    // 验证实例
    expect(instance instanceof Vue).toBe(true);
    expect(instance.message).toBe("Hello");
  });

  it("Vue.extend应该正确合并父类和子类选项", () => {
    // 给Vue添加全局mixin
    Vue.mixin({ globalOption: "global" });

    // 使用extend创建子类
    const SubComponent = Vue.extend({
      localOption: "local",
    });

    // 验证选项合并
    expect(SubComponent.options.globalOption).toBe("global");
    expect(SubComponent.options.localOption).toBe("local");
  });

  it("Vue.component应该正确注册全局组件", () => {
    // 注册组件
    Vue.component("test-global", {
      template: "<div>全局测试组件</div>",
    });

    // 验证组件已注册
    expect(Vue.options.components["test-global"]).toBeDefined();

    // 组件应该是构造函数
    expect(typeof Vue.options.components["test-global"]).toBe("function");
    expect(Vue.options.components["test-global"].prototype instanceof Vue).toBe(
      true
    );
  });

  it("Vue.component应该支持直接传入构造函数", () => {
    // 创建组件构造函数
    const Constructor = Vue.extend({
      template: "<div>构造函数组件</div>",
    });

    // 注册组件
    Vue.component("test-constructor", Constructor);

    // 验证组件已注册，并且与传入的构造函数相同
    expect(Vue.options.components["test-constructor"]).toBe(Constructor);
  });

  it("components合并策略应该创建继承链", () => {
    // 创建父选项
    const parentComponents = {
      "parent-component": { template: "<div>父组件</div>" },
    };

    // 创建子选项
    const childComponents = {
      "child-component": { template: "<div>子组件</div>" },
    };

    // 注册全局组件供测试
    Vue.options.components = { ...Vue.options.components, ...parentComponents };

    // 创建实例
    const vm = new Vue({
      components: childComponents,
    });

    // 验证组件选项
    expect(vm.$options.components["parent-component"]).toBeDefined();
    expect(vm.$options.components["child-component"]).toBeDefined();
  });

  it("initGlobalAPI应该正确初始化Vue全局API", () => {
    // 创建一个新的Vue构造函数进行测试
    function TestVue() {}

    // 初始化全局API
    initGlobalAPI(TestVue);

    // 验证全局API
    expect(TestVue.options).toBeDefined();
    expect(TestVue.options._base).toBe(TestVue);
    expect(TestVue.options.components).toBeDefined();
    expect(typeof TestVue.mixin).toBe("function");
    expect(typeof TestVue.extend).toBe("function");
    expect(typeof TestVue.component).toBe("function");
  });

  it("全局注册的组件在所有Vue实例中都可用", () => {
    // 保存原始DOM内容
    const originalHTML = document.body.innerHTML;

    // 设置DOM
    document.body.innerHTML = '<div id="app-global-test"></div>';

    // 注册全局组件
    Vue.component("globally-available", {
      template: '<div class="global">全局可用组件</div>',
    });

    // 创建Vue实例
    const vm = new Vue({
      el: "#app-global-test",
      template: "<div><globally-available></globally-available></div>",
    });

    // 验证组件可用
    expect(document.querySelector(".global")).not.toBeNull();

    // 恢复原始DOM内容
    document.body.innerHTML = originalHTML;
  });
});
