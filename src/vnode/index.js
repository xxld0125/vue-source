export function createElementVNode(vm, tag, data = {}, ...children) {
  let key = data?.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

/*
  AST 和 虚拟DOM的区别
  AST是语法层面的转化, 描述的是语法本身
  虚拟DOM是描述的DOM元素, 可以增加自定义属性
*/
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}

// 判断两个节点是否是同一个节点
export function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
