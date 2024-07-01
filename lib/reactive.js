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
      return target[key];
    },
    set(target, key, val) {
      target[key] = val;
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
