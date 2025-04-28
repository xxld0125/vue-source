import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Vue from "../src/index.js";
import { mountComponent } from "../src/lifecycle.js";

describe("Vue生命周期测试", () => {
  beforeEach(() => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("应该正确初始化Vue实例的生命周期方法", () => {
    const vm = new Vue({
      data: {
        message: "Hello Vue",
      },
    });

    // 检查生命周期相关方法是否已挂载
    expect(typeof vm._update).toBe("function");
    expect(typeof vm._render).toBe("function");
    expect(typeof vm._c).toBe("function");
    expect(typeof vm._v).toBe("function");
    expect(typeof vm._s).toBe("function");
  });

  it("mountComponent应该正确挂载组件", () => {
    // 创建一个Vue实例
    const vm = new Vue({});

    // 模拟render方法
    vm._render = vi.fn(() => "render result");
    vm._update = vi.fn();

    const el = document.querySelector("#app");

    // 调用mountComponent
    mountComponent(vm, el);

    // 验证
    expect(vm.$el).toBe(el);
    expect(vm._render).toHaveBeenCalled();
    expect(vm._update).toHaveBeenCalledWith("render result");
  });

  it("_s方法应该正确序列化值", () => {
    const vm = new Vue({});

    // 测试字符串输入
    expect(vm._s("test")).toBe("test");

    // 测试数字输入
    expect(vm._s(123)).toBe(123);

    // 测试对象输入
    const obj = { a: 1, b: 2 };
    expect(vm._s(obj)).toBe(JSON.stringify(obj));
  });

  it("patchProps应该正确设置DOM属性", () => {
    // 创建一个真实DOM元素
    const el = document.createElement("div");

    // 通过设置虚拟节点并调用_update方法来触发patchProps
    const vm = new Vue({});

    // 创建并应用虚拟节点
    vm.$el = document.querySelector("#app");
    vm._update(
      vm._c("div", {
        id: "test-id",
        class: "test-class",
        style: {
          color: "red",
          fontSize: "16px",
        },
      })
    );

    // 获取更新后的DOM
    const updatedEl = vm.$el;

    // 验证属性是否被正确设置
    expect(updatedEl.getAttribute("id")).toBe("test-id");
    expect(updatedEl.getAttribute("class")).toBe("test-class");
    expect(updatedEl.style.color).toBe("red");
    expect(updatedEl.style.fontSize).toBe("16px");
  });
});
