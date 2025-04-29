import { createElementVNode, createTextVNode } from "./vnode";
import Watcher from "./observe/watcher";

function createElm(vnode) {
  const { tag, children, text, data } = vnode;
  if (typeof tag === "string") {
    // 标签
    vnode.el = document.createElement(tag); // 将真实节点和虚拟节点进行关联

    // 更新属性
    patchProps(vnode.el, data);

    // 如果存在子节点, 则递归创建子节点
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }

  return vnode.el;
}

// 更新属性
function patchProps(el, props) {
  for (let key in props) {
    if (key === "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVNode, vnode) {
  // 初渲染流程
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; // 获取真实元素

    const parentElm = elm.parentNode; // 获取父元素

    let newElm = createElm(vnode); // 创建新节点

    parentElm.insertBefore(newElm, elm.nextSibling); // 在老节点后面插入新节点

    parentElm.removeChild(elm); // 删除老节点

    return newElm;
  } else {
    // diff算法
  }
}

export function initLifecycle(Vue) {
  // 将vnode 转为为真实DOM
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;

    // patch既有初始化的功能, 又有更新的功能
    vm.$el = patch(el, vnode);
  };

  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (val) {
    if (typeof val !== "object") return val;
    return JSON.stringify(val);
  };

  Vue.prototype._render = function (el) {
    const vm = this;

    return vm.$options.render.call(vm);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;

  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, true);
}

// 调用钩子
export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
