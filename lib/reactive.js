/**
 * @file
 * reactive 模块，提供reactive API，将原始对象转换为响应式对象
 * @module reactive
 */

import { track, trigger } from "./core.js";

function plainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * ### 浅层响应
 * 根据原始数据生成代理对象，代理对象的读写操作会进行依赖收集和依赖触发，原型上的属性以及symbol除外，
 * 因此, **不要使用symbol类型作为数据属性**
 * @param {object} data 原始数据
 * @returns { Proxy } 由原始数据生成的代理对象
 */
export function shallowReactive(data) {
  return new Proxy(data, {
    get(target, key) {
      if (typeof key === "symbol") return Reflect.get(...arguments);
      if (Object.prototype.hasOwnProperty(key))
        return Reflect.get(...arguments);
      track(target, key);
      // return target[key];
      /**
       * ### 用Reflect API来实现更合理，避免出现响应式无法建立的bug，如下
       * ```js
       * const obj = {
       *   foo: 1,
       *   get bar() {
       *     return this.foo
       *   }
       * }
       * // 使用原来的代理方式
       * const p = shallowReactive(obj);
       *
       * effect(() => {
       *   console.log(p.bar); // 1
       * });
       *
       * // p.bar在执行过程中，this值为obj, 实际上执行了obj.foo, 在原始对象读取属性不会建立响应式联系
       * p.foo = 2; // 不会触发重新打印p.bar的函数
       * ```
       */
      return Reflect.get(target, key, receiver);
    },
    set(target, key, val) {
      // target[key] = val;
      Reflect.set(target, key, val, receiver);
      trigger(target, key);
      return true;
    },
  });
}

/**
 * ### 深层响应
 * 根据原始数据生成代理对象，代理对象的读写操作会进行依赖收集和依赖触发, 原型上的属性以及symbol除外，
 * 因此, **不要使用symbol类型作为数据属性**
 * @param {object} data 原始数据
 * @returns { Proxy } 由原始数据生成的代理对象
 */
export default function reactive(data) {
  return new Proxy(data, {
    get(target, key) {
      if (typeof key === "symbol") return Reflect.get(...arguments);
      if (Object.prototype.hasOwnProperty(key))
        return Reflect.get(...arguments);
      track(target, key);
      const value = target[key];
      if (typeof value === "object" && plainObject(value)) {
        return reactive(value);
      } else {
        return value;
      }
    },
    set(target, key, val) {
      target[key] = val;
      trigger(target, key);
      return true;
    },
  });
}
