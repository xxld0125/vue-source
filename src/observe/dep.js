let id = 0;

class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 存储watcher
  }

  depend() {
    Dep.target.addDep(this);

    /*
    dep 和 watcher 的关系是多对多的关系
    一个属性可以在多个组件中使用(一个 dep 对应多个 watcher)
    一个组件由多个属性组成(一个 watcher 对应多dep)
    */
  }

  addSub(watcher) {
    this.subs.push(watcher); // 将watcher添加到dep中
  }

  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}

Dep.target = null; // 当前的watcher

export default Dep;
