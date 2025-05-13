# Vue 生态面试题解析

本文整理了 Vue 生态相关的面试题及其详细解答，包括 Vite、Vue Router、Vuex 和 Pinia 等工具。

## Vite 相关

### Vite 相比 webpack 有哪些优势？

1. **开发启动更快**：Vite 不需要打包就可以开发，利用浏览器原生 ES 模块支持
2. **热更新更快**：Vite 只需要精确定位变化的模块进行热更新，而不是重新构建整个包
3. **构建更快**：生产构建基于 Rollup，针对静态资源进行了优化
4. **更现代化**：设计上更符合现代前端开发需求，内置支持 TypeScript、JSX 等

### Vite 的依赖预构建是什么，为什么需要它？

依赖预构建是 Vite 将 node_modules 中的包转换为 ESM 格式的过程，主要有两个目的：

1. 将 CommonJS 或 UMD 发布的依赖转换为 ESM 格式，使浏览器可以直接使用
2. 将有许多内部模块的 ESM 依赖转换为单个模块，减少 HTTP 请求

## Vue Router 相关

### Vue Router 的导航守卫有哪些？执行顺序是什么？

Vue Router 的导航守卫包括：

1. 全局前置守卫：router.beforeEach
2. 全局解析守卫：router.beforeResolve
3. 全局后置钩子：router.afterEach
4. 路由独享守卫：beforeEnter
5. 组件内守卫：beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave

完整的导航解析流程是：

1. 导航被触发
2. 在失活的组件里调用 beforeRouteLeave
3. 调用全局的 beforeEach
4. 在重用的组件里调用 beforeRouteUpdate
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve
9. 导航被确认
10. 调用全局的 afterEach
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数

## Vuex 相关

### Vuex 的核心概念有哪些？它们的作用是什么？

Vuex 的核心概念包括：

1. **State**：存储应用的状态数据
2. **Getters**：类似计算属性，从 state 派生出新的状态
3. **Mutations**：同步修改 state 的方法
4. **Actions**：可包含异步操作，提交 mutation
5. **Modules**：将 store 分割为模块，每个模块有自己的 state、getters、mutations 和 actions

### Vuex 和 Pinia 有什么区别？

主要区别：

1. **API 设计**：Pinia 更简洁，去除了 mutations，只有 state、getters 和 actions
2. **TypeScript 支持**：Pinia 提供了更好的 TypeScript 支持
3. **模块化**：Pinia 不需要嵌套模块，每个 store 都独立
4. **开发工具支持**：都支持 Vue DevTools，但 Pinia 设计更现代
5. **性能**：Pinia 打包后体积更小，约 1KB
6. **组合式 API**：Pinia 对组合式 API 有更好的支持

> 本文档将持续更新，添加更多面试题及其源码解析。
