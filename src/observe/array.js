let oldArrayMethods = Array.prototype;

let arrayMethods = Object.create(oldArrayMethods);

let methods = ["push", "pop", "shift", "unshift", "sort", "splice", "reverse"];

methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    const result = oldArrayMethods[method].call(this, ...args);

    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
      default:
        break;
    }

    // 对数组中插入的值进行劫持
    if (inserted) {
      this.__ob__.observeArray(inserted);
    }

    return result;
  };
});

export default arrayMethods;
