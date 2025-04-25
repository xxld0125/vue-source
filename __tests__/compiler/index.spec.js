import { describe, it, expect, vi } from "vitest";
import { compileToFunction } from "../../src/compiler/index.js";
import Vue from "../../src/index.js";

describe("HTML模板解析测试", () => {
  // 在测试之前，修改compileToFunction函数以便返回ast，使其可测试
  // 因为源码中的compileToFunction没有返回ast，只是在控制台打印了它

  // 测试parseHTML函数的间接调用
  it("应该能够解析简单的HTML模板", () => {
    const template = `<div id="app"><p>Hello</p></div>`;

    // 创建一个spy来捕获控制台输出
    const consoleSpy = vi.spyOn(console, "log");

    compileToFunction(template);

    // 验证console.log被调用了
    expect(consoleSpy).toHaveBeenCalled();

    // 获取传递给console.log的参数（即AST）
    const ast = consoleSpy.mock.calls[0][0];

    // 验证AST结构
    expect(ast).toBeDefined();
    expect(ast.type).toBe(1); // 元素类型
    expect(ast.tag).toBe("div");
    expect(ast.attrs).toEqual([{ name: "id", value: "app" }]);
    expect(ast.children).toHaveLength(1);

    // 验证子元素
    const child = ast.children[0];
    expect(child.type).toBe(1);
    expect(child.tag).toBe("p");
    expect(child.children).toHaveLength(1);

    // 验证文本节点
    const textNode = child.children[0];
    expect(textNode.type).toBe(3); // 文本类型
    expect(textNode.text).toBe("Hello");

    // 清理spy
    consoleSpy.mockRestore();
  });

  it("应该能够解析多层嵌套的HTML结构", () => {
    const template = `<div><span><a>点击</a></span><p>段落</p></div>`;

    const consoleSpy = vi.spyOn(console, "log");

    compileToFunction(template);

    const ast = consoleSpy.mock.calls[0][0];

    // 验证AST结构
    expect(ast).toBeDefined();
    expect(ast.type).toBe(1);
    expect(ast.tag).toBe("div");
    expect(ast.children).toHaveLength(2);

    // 验证第一个子元素（span及其嵌套结构）
    const spanElement = ast.children[0];
    expect(spanElement.type).toBe(1);
    expect(spanElement.tag).toBe("span");
    expect(spanElement.children).toHaveLength(1);

    const aElement = spanElement.children[0];
    expect(aElement.type).toBe(1);
    expect(aElement.tag).toBe("a");
    expect(aElement.children).toHaveLength(1);

    const aTextNode = aElement.children[0];
    expect(aTextNode.type).toBe(3);
    expect(aTextNode.text).toBe("点击");

    // 验证第二个子元素（p标签）
    const pElement = ast.children[1];
    expect(pElement.type).toBe(1);
    expect(pElement.tag).toBe("p");
    expect(pElement.children).toHaveLength(1);

    const pTextNode = pElement.children[0];
    expect(pTextNode.type).toBe(3);
    expect(pTextNode.text).toBe("段落");

    consoleSpy.mockRestore();
  });

  it("应该正确解析带属性的HTML元素", () => {
    const template = `<div id="app" class="container" data-test="value"></div>`;

    const consoleSpy = vi.spyOn(console, "log");

    compileToFunction(template);

    const ast = consoleSpy.mock.calls[0][0];

    // 验证AST结构
    expect(ast).toBeDefined();
    expect(ast.type).toBe(1);
    expect(ast.tag).toBe("div");

    // 验证属性
    expect(ast.attrs).toHaveLength(3);
    expect(ast.attrs).toContainEqual({ name: "id", value: "app" });
    expect(ast.attrs).toContainEqual({ name: "class", value: "container" });
    expect(ast.attrs).toContainEqual({ name: "data-test", value: "value" });

    consoleSpy.mockRestore();
  });

  it("Vue实例应该能够正确编译模板", () => {
    // 创建一个简单的DOM环境
    document.body.innerHTML = `<div id="app"></div>`;

    // 创建Vue实例时使用模板
    const consoleSpy = vi.spyOn(console, "log");

    const vm = new Vue({
      el: "#app",
      template: `<div id="app"><h1>标题</h1><p>内容</p></div>`,
    });

    // 验证compile被调用并生成了AST
    expect(consoleSpy).toHaveBeenCalled();

    const ast = consoleSpy.mock.calls[0][0];

    // 验证AST结构
    expect(ast).toBeDefined();
    expect(ast.type).toBe(1);
    expect(ast.tag).toBe("div");
    expect(ast.attrs).toEqual([{ name: "id", value: "app" }]);
    expect(ast.children).toHaveLength(2);

    // 清理
    consoleSpy.mockRestore();
    document.body.innerHTML = "";
  });
});
