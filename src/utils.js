// 静态方法
const strats = {};
const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return [c];
      }
    } else {
      return p;
    }
  };
});

// 组件的合并策略
strats.components = function (parentVal, childVal) {
  const res = Object.create(parentVal); // 创建一个新对象, 继承parentVal
  if (childVal) {
    // 如果childVal存在, 则将childVal的属性添加到res中
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
};

export function mergeOptions(parent, child) {
  const options = {};

  for (const key in parent) {
    mergeField(key);
  }

  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key]; // 如果子选项有，就使用子选项，否则使用父选项
    }
  }

  return options;
}
