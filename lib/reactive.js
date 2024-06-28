/**
 * @file
 * reactive 模块，提供reactive API，将原始对象转换为响应式对象
 * @module reactive
 */

import { track, trigger } from "./core.js";

/**
 * 根据原始数据生成代理对象，代理对象的读写操作会进行依赖收集和依赖触发
 * @param {object} data 原始数据
 * @returns { Proxy } 由原始数据生成的代理对象
 */
export default function reactive(data) {
  return new Proxy(data, {
    get(target, key) {
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
