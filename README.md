# vue2-source

vue2 源码学习

## 项目环境要求

- Node.js: v20.12.1 (建议使用 nvm 管理 Node.js 版本)
- 包管理工具: pnpm

## 项目初始化

### 克隆代码

```bash
git clone https://github.com/xxld0125/vue2-source.git
cd vue2-source
```

### 安装依赖

```bash
pnpm install
```

如果需要手动安装开发依赖：

```bash
pnpm add rollup rollup-plugin-babel @babel/core @babel/preset-env --save-dev
```

## 开发命令

启动开发环境（带热重载）：

```bash
pnpm dev
```

## 项目结构

```
├── src             # 源代码目录
│   └── index.js    # 入口文件
├── dist            # 构建输出目录
├── rollup.config.js # Rollup 配置文件
├── .babelrc        # Babel 配置文件
├── .nvmrc          # Node.js 版本配置
└── package.json    # 项目配置文件
```

## 构建配置

项目使用 Rollup 作为构建工具，配置如下：

- 入口文件: `src/index.js`
- 输出文件: `dist/vue.js`
- 输出格式: UMD
- 启用 sourcemap
