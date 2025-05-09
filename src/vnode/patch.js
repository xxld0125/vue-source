import { isSameVnode } from "./index";

function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode); // 初始化组件
  }
  if (vnode.componentInstance) {
    return true; // 说明是组件
  }
}

export function createElm(vnode) {
  const { tag, children, text, data } = vnode;
  if (typeof tag === "string") {
    // 创建真实元素, 也要区分组件还是元素
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }

    // 标签
    vnode.el = document.createElement(tag); // 将真实节点和虚拟节点进行关联

    // 更新属性
    patchProps(vnode.el, {}, data);

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
export function patchProps(el, oldProps = {}, props = {}) {
  let oldStyles = oldProps.style || {};
  let newStyles = props.style || {};

  // 删除老的样式
  for (let key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = "";
    }
  }

  // 删除老的属性
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }

  // 将新属性覆盖老属性
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

export function patch(oldVNode, vnode) {
  if (!oldVNode) {
    // 组件的挂载
    return createElm(vnode);
  }

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
    return patchVnode(oldVNode, vnode);
  }
}

// diff算法: 同级比较
function patchVnode(oldVNode, vnode) {
  // 1.两个节点不是同一个节点, 直接用新的节点替换老的节点
  if (!isSameVnode(oldVNode, vnode)) {
    let newElm = createElm(vnode);
    oldVNode.el.parentNode.replaceChild(newElm, oldVNode.el);
    return newElm;
  }

  // 复用老节点的元素
  let el = (vnode.el = oldVNode.el);

  // 文本场景
  if (!oldVNode.tag) {
    // !oldVNode.tag表示文本场景
    if (oldVNode.text !== vnode.text) {
      oldVNode.el.textContent = vnode.text;
    }
  }

  // 相同标签场景下, 对比标签的属性
  patchProps(el, oldVNode.data, vnode.data);

  // 比较儿子节点
  let oldChildren = oldVNode.children || [];
  let newChildren = vnode.children || [];

  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 两方都有儿子, 完整的diff算法
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    // 老的没有儿子, 新的有儿子, 此时需要将新的儿子插入到老的节点中
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    // 老的有儿子, 新的没有儿子, 此时需要将老的儿子删除
    el.innerHTML = "";
  }
  return el;
}

// 挂载子节点
function mountChildren(el, newChildren) {
  newChildren.forEach((child) => {
    el.appendChild(createElm(child));
  });
}

// 更新子节点
// 该方法包含一个面试题: vue2中循环时为什么要加key?
// 答: 因为vue2中采用双指针方法比较, 如果两个节点相同, 则递归比较子节点, 如果两个节点不同, 则将新的节点插入到老的节点中, 如果老的节点有剩余, 则将剩余的老节点删除
function updateChildren(el, oldChildren, newChildren) {
  // vue2中采用双指针方法比较
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[oldStartIndex];
  let newStartVnode = newChildren[newStartIndex];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  function markIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }

  // 1. 比较旧前和旧后, 新前和新后的索引
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      // 如果老的头节点为空, 则将老的头节点设置为老的节点的下一个节点
      oldStartVnode = oldChildren[++oldStartIndex]; // 移动索引
    } else if (!oldEndVnode) {
      // 如果老的尾节点为空, 则将老的尾节点设置为老的节点的上一个节点
      oldEndVnode = oldChildren[--oldEndIndex]; // 移动索引
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头头比对
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex]; // 移动索引
      newStartVnode = newChildren[++newStartIndex]; // 移动索引
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 尾尾比对
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 尾头比对
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾节点插入到老的头节点的前面
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 头尾比对
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 将老的头节点插入到老的尾节点的后面
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      // 乱序比对

      // 根据老的列表做一个映射表, 用新的key去映射老的节点, 找得到则移动, 找不到则添加, 最后多余的节点删除
      let map = markIndexByKey(oldChildren);
      let moveIndex = map[newStartVnode.key]; // 找到对应的索引

      if (moveIndex !== undefined) {
        // 如果找到了对应的节点, 则将老的节点移动到新的节点的前面
        let moveVnode = oldChildren[moveIndex];
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = undefined; // 将老的节点设置为undefined

        patchVnode(moveVnode, newStartVnode); // 递归比较子节点
      } else {
        // 找不到则添加
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }

      // 移动索引
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  // 如果新节点有剩余, 则将剩余的新节点插入到老的节点中
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);
      // 可能是向后增加, 也可能是向前增加
      // 所以需要找到锚点, 如果新节点有下一个节点, 则将新节点插入到下一个节点的前面, 否则将新节点插入到老的节点的后面
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null;
      el.insertBefore(childEl, anchor);
    }
  }

  // 如果老节点有剩余, 则将剩余的老节点删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        // 如果老的节点不为空, 则将老的节点删除
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}
