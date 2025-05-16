---
title: Vue2相关面试题
outline: deep
---

# Vue2 相关面试题

## 1. `Vue`响应式数据的理解

Vue2 的响应式系统可以监控数据的修改和获取操作。针对对象格式，会给每个对象的属性进行劫持，使用 `Object.defineProperty` 实现。

从源码层面分析，实现流程为：`initData` -> `observe` -> `defineReactive`。内部对所有属性都进行了重写（这也是 Vue2 响应式系统的性能问题所在）。系统会递归给对象的属性增加 `getter` 和 `setter`。

使用 Vue2 时，如果数据层级过深，需要考虑以下优化方案：

- 非响应式数据不要放在 `data` 中
- 属性取值时避免多次重复取值
- data 中的对象可以考虑使用 `Object.freeze()` 冻结对象，阻止其转换为响应式

## 2.`Vue`中如何检测数组变化

Vue2 中检测数组的变化并没有采取 `defineProperty`，因为修改索引的情况不多(如果直接使用 `defineProperty` 会浪费大量性能)。采用重写数组的方法来实现(函数劫持)。

实现流程：`initData` -> `observe` -> 对我们传入的数组进行原型链修改，后续调用的方法都是重写后的方法 -> 对数组中的每个对象也再次进行代理

**修改数组的索引、数组的长度是无法监控的，不会触发视图更新**

## 3.`Vue`中如何进行依赖收集

所谓的依赖收集就是观察者模式。被观察者指代的是数据(`dep`)，观察者(`watcher`，有三种 `watcher`分别是渲染 `watcher`、计算属性 `watcher`、用户 `watcher`)。

一个 `watcher`中可能对应对个数据。`watcher`中还需要保存 `dep`(重新渲染时可以让属性重新记录 `watcher`)，计算属性也会用到。

`watcher`和 `dep`的关系是多对多的关系，一个 `dep`对应多个 `watcher`，一个 `watcher`对应多个 `watcher`。默认渲染时会进行依赖手机(会触发 `getter`方法)，数据更新了就找到属性对应的 `watcher`去触发更新。

## 4.`Vue`中模版编译原理

用户传递的是 `template` 属性, 我们需要将这个 `template` 编译成 `render` 函数

- `template` -> `ast` 语法树
- 对语法树进行标记(标记的是静态节点)
- 将 `ast` 语法树 生成 `render` 函数

最终每次渲染可以调用 `render` 函数返回对应的虚拟节点(递归是先子后父)。

## 5.`Vue`生命周期钩子是如何实现的

内部利用了一个 **发布订阅模式**，将用户写的钩子维护成一个数组，后续一次调用 callHook 执行。主要是通过 `mergeOptions` 合并钩子。

## 6.`Vue`的生命周期方法有哪些？一般是在哪一步发送请求及原因

一般在 `mounted`

## 7.`Vue.mixin`的使用场景和原理

可以通过 `Vue.mixin` 来实现逻辑的复用，问题在于数据来源不明确。声明的时候可能会导致命名冲突。高阶组件，`Vue3` 采用的就是 `compositionApi` 解决了复用问题

## 8.`Vue`组件 `data`为什么必须是个函数？

原因就在于相对于根实例而言，`new Vue` 组件是通过同一个构造函数多次创建实例，如果是同一个对象的话，那么数据会被互相影响。每个组件都应该是独立的，那么每次都调用 `data` 会返回一个新对象。

## 9.`nextTick`在哪里使用? 原理是？

`nextTick` 内部采用了异步任务进行包装(多个 `nextTick` 在内部会合并回调成一个队列)，左后在异步任务中批量处理。主要应用场景就是异步更新(默认调度的时候，就会添加一个 `nextTick` 任务)用户为了获取最终的渲染结果需要在内部任务执行之后再执行用户逻辑。这时候用户需要将对应的逻辑放到 `nextTick` 中。

## 10.`$attrs`和 `$listeners`

- `$attrs`: 组件上所有的属性,不包括 `props`
- `$listeners`: 组件上所有的事件

## 11.`v-if`、`v-model`、`v-for`的实现原理

- `v-if `: 会被编译成三元表达式
- `v-for`: 会被编译成 `_l` 循环
- `v-model`:
  - 绑定到元素上：可以实现双向绑定。 `v-model` 放在不同的元素上会编译出不用的结果，针对文本表单会处理文本相关操作(编译成 `value `+ `input` 事件 + 指令)，其中 `value` 和 `input` 实现双向绑定并阻止中文输入的触发。指令的作用就是处理中文输入完成后的手动触发更新。
  - 绑定到组件上：会编译成一个 `mode` 对象(组件在创建虚拟节点时生成)。会解析成 `value` + `input` 语法糖(如果有自定义的 `prop` 和 `event` 则优先使用自定义的)。

## 12.`Vue`中 `.sync`修饰符的作用、用法及实现原理

和 `v-model` 一样，这个 api 是为了实现状态同步的。在 `vue3` 中被移除了。

编译后的代码如下：

```javascript
function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("my", {
    attrs: {
      name: _vm.name,
    },
    on: {
      "update:name": function ($event) {
        _vm.name = $event;
      },
    },
  });
}
```

## 13.`Vue.use`是干什么的？原理是什么？

`use` 方法目的是将 `Vue` 的构造函数传递给插件中, 让所有的插件依赖的 `Vue` 是同一个版本。

默认调用插件方法 或 调用插件的 `install` 方法。

`vue-router` 和 `vuex` 中 `package` 的依赖里面没有 `vue`, 是通过 `use` 进行传递的。

## 14.组件中写 `name`选项有什么好处和作用？

- 在 `Vue` 中有 `name` 属性的组件可以被递归调用(在写模版语法时，我们可以通过 `name` 属性来递归调用自己)。通过在声明组件的时候 `Sub.options.components[name] = Sub` 实现。
- 用来标识组件，通过 `name` 来找到对应的组件，自己封装跨级通信。
- `name` 属性可以用作 `devtools` 调试工具中标明具体的组件。

## 15.

## 高级原理

> 更多面试题将陆续添加...
