// 判断是否是html标签
const isReservedTag = (tag) => {
  return ["div", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag);
};

// 根据tag类型, 创建不同的虚拟节点, 即html标签或自定义组件
export function createElementVNode(vm, tag, data = {}, ...children) {
  let key = data?.key;
  if (key) {
    delete data.key;
  }

  // 判断是否是html标签
  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, data, children);
  } else {
    // 创造一个组件的虚拟节点
    let Ctor = vm.$options.components[tag]; // 获取组件的构造函数

    // Ctor就是组件的定义, 可能是Sub类, 也有可能是组件的obj选项
    return createComponentVNode(vm, tag, key, data, children, Ctor);
  }
}

// 创造一个组件的虚拟节点
function createComponentVNode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === "object") {
    Ctor = vm.$options._base.extend(Ctor);
  }

  // 确保data对象存在
  if (!data) {
    data = {};
  }

  data.hook = {
    init(vnode) {
      // 保存组件的实例到虚拟节点上
      let instance = (vnode.componentInstance =
        new vnode.componentOptions.Ctor());

      // 挂载组件
      instance.$mount();
    },
  };

  return vnode(vm, tag, key, data, children, null, {
    Ctor,
  });
}

export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

/*
  AST 和 虚拟DOM的区别
  AST是语法层面的转化, 描述的是语法本身
  虚拟DOM是描述的DOM元素, 可以增加自定义属性
*/
function vnode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions, // 组件的构造函数
  };
}

// 判断两个节点是否是同一个节点
export function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
