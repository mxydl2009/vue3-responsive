/**
 * @file
 * computed API的具体实现
 *
 * @module computed
 *
 */

import { effect, track, trigger } from "./core.mjs";

/**
 * @title 计算属性
 *
 * @description
 *
 * 计算属性的实现方案
 *
 * 1. 实现懒计算：在读取计算属性的值时才真正计算;
 * 2. 实现缓存：多次读取计算属性值时，如果源值没有变化，则不需要重新计算: dirty标志位
 * 3. 源数据变更不会立即触发getter执行，而是读取值时才触发getter执行: 源数据变更触发dirty标志位变为true
 * @param {function} getter getter函数，返回一个值(由其他响应式数据派生)
 *
 * @returns {object} 计算属性返回的对象，读取该对象的value可以得到计算属性值
 */
export default function computed(getter) {
  // 标志位，表示是否需要重新计算，dirty为true表示需要重新计算, 初始值为true，表示需要计算
  let dirty = true;
  // options.lazy参数，effect返回副作用函数的引用，由使用者调用;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      trigger(obj, "value");
    },
  });
  let res;
  const obj = {
    get value() {
      track(obj, "value");
      if (dirty) {
        res = effectFn();
        dirty = false;
      }

      // return effectFn();
      return res;
    },
  };
  return obj;
}
