let id = 0; // 不同组件有不同的watcher
import Dep from "./dep";

// 观察者模式
// 每个属性有一个dep(属性就是被观察者), watcher就是观察者(属性变化了会通知观察者来更新)
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++; // 每个watcher都有一个唯一的id

    this.renderWatcher = options; // 是否是渲染watcher

    this.getter = fn; // 渲染watcher的回调

    this.deps = []; // 存储dep, 后续实现计算属性, 和一些清理工作需要

    this.depsId = new Set();

    this.get(); // 执行渲染watcher的回调
  }

  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      // 去重
      this.depsId.add(id);
      this.deps.push(dep); // 将dep添加到watcher中
      dep.addSub(this); // 将watcher添加到dep中
    }
  }

  get() {
    Dep.target = this; // 将当前的watcher设置为Dep的target
    this.getter();
    Dep.target = null; // 清空Dep的target
  }

  update() {
    this.get(); // 重新渲染
  }
}

export default Watcher;
