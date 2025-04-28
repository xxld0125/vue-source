import { describe, it, expect } from "vitest";
import Vue from "../src/index.js";

describe("Vue构造函数测试", () => {
  it("Vue应该是一个函数并可以创建实例", () => {
    expect(typeof Vue).toBe("function");
    const vm = new Vue({});
    expect(vm).toBeInstanceOf(Vue);
    expect(typeof vm._init).toBe("function");
  });

  it("应该正确处理各种选项类型", () => {
    const vm1 = new Vue({
      data: { a: 1 },
    });
    expect(vm1.a).toBe(1);

    const vm2 = new Vue({
      data() {
        return { b: 2 };
      },
    });
    expect(vm2.b).toBe(2);

    const vm3 = new Vue({
      props: ["prop1", "prop2"],
    });
    expect(vm3.$options.props).toEqual(["prop1", "prop2"]);
  });

  it("应该初始化生命周期相关方法", () => {
    const vm = new Vue({});

    // 检查initLifecycle添加的方法
    expect(typeof vm._update).toBe("function");
    expect(typeof vm._render).toBe("function");
    expect(typeof vm._c).toBe("function");
    expect(typeof vm._v).toBe("function");
    expect(typeof vm._s).toBe("function");
  });

  it("应该在创建实例时自动调用_init方法", () => {
    // 创建一个继承自Vue的子类，以便我们可以监视_init方法
    class ExtendedVue extends Vue {
      constructor(options) {
        super(options);
      }
    }

    // 创建_init方法的spy
    const originalInit = ExtendedVue.prototype._init;
    ExtendedVue.prototype._init = function (options) {
      this.initCalled = true;
      return originalInit.call(this, options);
    };

    // 创建实例
    const vm = new ExtendedVue({
      data: { message: "Hello" },
    });

    // 验证_init被调用
    expect(vm.initCalled).toBe(true);

    // 验证数据被正确初始化
    expect(vm.message).toBe("Hello");
  });

  it("应该在提供el选项时自动挂载", () => {
    // 设置DOM环境
    document.body.innerHTML = `<div id="app"></div>`;

    // 监视$mount方法
    const originalMount = Vue.prototype.$mount;
    Vue.prototype.$mount = function (el) {
      this.mountCalled = true;
      return originalMount.call(this, el);
    };

    // 创建实例并提供el选项
    const vm = new Vue({
      el: "#app",
    });

    // 验证$mount被调用
    expect(vm.mountCalled).toBe(true);

    // 恢复原始方法
    Vue.prototype.$mount = originalMount;
    document.body.innerHTML = "";
  });

  it("应该提供$nextTick方法用于异步DOM更新", async () => {
    const vm = new Vue({});

    // 检查$nextTick方法是否存在
    expect(typeof vm.$nextTick).toBe("function");

    // 模拟异步操作
    let flag = false;
    vm.$nextTick(() => {
      flag = true;
    });

    // 等待nextTick回调执行
    await Promise.resolve();

    // 验证回调已执行
    expect(flag).toBe(true);
  });
});
