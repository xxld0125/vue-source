import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: "/vue2-source/", // 设置GitHub Pages的基本路径
    title: "Vue生态源码学习",
    description: "Vue生态源码实现与学习笔记",
    themeConfig: {
      nav: [
        { text: "首页", link: "/" },
        {
          text: "Vue2",
          items: [
            { text: "核心模块", link: "/vue2/core-modules" },
            { text: "开发进度", link: "/vue2/development-progress" },
            { text: "流程图", link: "/vue2/flowcharts/" },
          ],
        },
        {
          text: "Vue3",
          items: [
            { text: "核心模块", link: "/vue3/core-modules" },
            { text: "响应式系统", link: "/vue3/reactivity" },
          ],
        },
        {
          text: "生态",
          items: [
            { text: "Vite", link: "/ecosystem/vite/" },
            { text: "Vue Router", link: "/ecosystem/vue-router/" },
            { text: "Vuex", link: "/ecosystem/vuex/" },
            { text: "Pinia", link: "/ecosystem/pinia/" },
          ],
        },
        { text: "面试题", link: "/interview/" },
      ],
      sidebar: {
        "/vue2/": [
          {
            text: "Vue2源码",
            items: [
              { text: "核心模块", link: "/vue2/core-modules" },
              { text: "开发进度", link: "/vue2/development-progress" },
            ],
          },
          {
            text: "流程图",
            items: [
              { text: "概述", link: "/vue2/flowcharts/" },
              { text: "响应式系统", link: "/vue2/flowcharts/reactive-system" },
              {
                text: "计算属性实现",
                link: "/vue2/flowcharts/computed-implementation",
              },
              { text: "Diff算法", link: "/vue2/flowcharts/diff-algorithm" },
              {
                text: "组件渲染",
                link: "/vue2/flowcharts/component-rendering",
              },
              {
                text: "keep-alive组件缓存",
                link: "/vue2/flowcharts/keep-alive-component-rerendering",
              },
            ],
          },
        ],
        "/vue3/": [
          {
            text: "Vue3源码",
            items: [
              { text: "核心模块", link: "/vue3/core-modules" },
              { text: "响应式系统", link: "/vue3/reactivity" },
            ],
          },
        ],
        "/ecosystem/vite/": [
          {
            text: "Vite源码",
            items: [{ text: "架构概览", link: "/ecosystem/vite/architecture" }],
          },
        ],
        "/ecosystem/vue-router/": [
          {
            text: "Vue Router源码",
            items: [
              {
                text: "路由实现原理",
                link: "/ecosystem/vue-router/principles",
              },
            ],
          },
        ],
        "/ecosystem/vuex/": [
          {
            text: "Vuex源码",
            items: [
              { text: "状态管理原理", link: "/ecosystem/vuex/principles" },
            ],
          },
        ],
        "/ecosystem/pinia/": [
          {
            text: "Pinia源码",
            items: [{ text: "设计理念", link: "/ecosystem/pinia/design" }],
          },
        ],
        "/interview/": [
          {
            text: "面试题解析",
            items: [
              { text: "Vue2面试题", link: "/interview/vue2" },
              { text: "Vue3面试题", link: "/interview/vue3" },
              { text: "生态面试题", link: "/interview/ecosystem" },
            ],
          },
        ],
      },
    },
    outDir: "../dist-docs",
    // Mermaid配置
    mermaid: {
      // 可选的Mermaid配置
      theme: "default",
      // 其他Mermaid配置选项...
    },
    // Vite配置
    vite: {
      // 优化依赖
      optimizeDeps: {
        include: ["dayjs", "mermaid"],
        exclude: ["vitepress-plugin-mermaid"],
      },
    },
  })
);
