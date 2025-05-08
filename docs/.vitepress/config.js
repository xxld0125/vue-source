import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: "/vue2-source/",  // 设置GitHub Pages的基本路径
    title: "Vue2源码学习",
    description: "Vue2源码实现与学习笔记",
    themeConfig: {
      nav: [
        { text: "首页", link: "/" },
        { text: "核心模块", link: "/core-modules" },
        { text: "开发进度", link: "/development-progress" },
        { text: "流程图", link: "/flowcharts/" },
      ],
      sidebar: {
        "/": [
          {
            text: "介绍",
            items: [{ text: "首页", link: "/" }],
          },
          {
            text: "核心文档",
            items: [
              { text: "核心模块", link: "/core-modules" },
              { text: "开发进度", link: "/development-progress" },
            ],
          },
          {
            text: "流程图",
            items: [
              { text: "概述", link: "/flowcharts/" },
              {
                text: "计算属性实现",
                link: "/flowcharts/computed-implementation",
              },
              { text: "Diff算法", link: "/flowcharts/diff-algorithm" },
            ],
          },
        ],
      }
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
