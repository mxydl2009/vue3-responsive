/**
 * @file
 * watch API具体实现
 *
 * @module watch
 *
 */

import { effect } from "./index.mjs";

/**
 * 侦听器: 侦听响应式数据变化并通知回调函数
 * 通常副作用函数内部在读取属性值时会被搜集到该属性的依赖集合中，但是如果副作用函数没有触发读取操作时，就无法自动触发搜集依赖的操作;
 * 因此，侦听器就需要手动触发搜集依赖的操作。
 * 1. 第一种方式：递归地对source对象的属性进行手动追踪依赖，在set trap中触发cb，这种方式适合source是plain object;
 * 2. 第二种方式：使用effect函数，传入的fn递归地读取source的属性（自动追踪依赖,因为此时的source已经是响应式数据了），options.scheduler函数调用cb，这样响应式副作用就变成了scheduler函数了;
 * @param {object|getter} source 被侦听的响应式数据或者getter函数
 * @param {function} cb 数据变化触发的回调函数
 * @returns {undefined}
 */
export default function watch(source, cb, options = {}) {
  // source更新时，触发cb执行, cb能接收到更新前和更新后的值， 深度监听时，新值和旧值都是被监听对象的引用地址，没有太大意义
  // 通常，source为一个getter函数时，更有意义，getter函数返回的值作为新旧值更有意义
  let getter;
  let oldVal, newVal;
  if (typeof source === "function") {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let cleanup;
  function onInvalidate(fn) {
    cleanup = fn;
  }
  const job = () => {
    newVal = effectFn();
    if (cleanup) {
      cleanup();
    }
    cb(newVal, oldVal, onInvalidate);
    oldVal = newVal;
  };
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (options.flush === "post") {
        Promise.resolve().then(() => {
          job();
        });
      } else {
        job();
      }
    },
  });
  oldVal = effectFn();
  if (options.immediate === true) {
    cb(oldVal);
  }
}

/** 深度读取obj数据
 *
 * @param {*} obj 要深度读取的数据
 * @param {*} readAlready 已经读取过的数据，避免因为循环引用导致的无限递归
 * @returns {obj | function | undefined}
 */
function traverse(obj, readAlready = new Set()) {
  if (typeof obj !== "object" && obj === null && readAlready.has(obj)) return;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty(key, obj)) {
      const value = obj[key];
      readAlready.add(value);
      traverse(value, readAlready);
    }
  }
  return obj;
}
