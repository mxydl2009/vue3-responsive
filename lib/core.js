/**
 * @file
 * 响应式系统的核心文件,
 * 包含了响应式系统的核心思想和方法，暴露给外部实现更加丰富的响应式功能API
 *
 * @module core
 *
 */

let activeEffect;
// 副作用函数执行栈，activeEffect指针永远指向栈顶
const effectStack = [];
// 记录字段与依赖的映射, target -> Map(key, value): (key:字段，value: Set<effectFn>)
const bucket = new WeakMap();

/**
 * @title 注册副作用函数fn
 * @description 将全局指针activeEffect指向副作用函数fn, 在读取字段时通过activeEffect指针收集依赖, 注册函数只调用一次，用于建立对象读取与副作用函数的响应式联系
 * @param {function} fn 副作用函数
 * @returns { undefined | function } 根据是否配置lazy选项而是否返回副作用函数引用还是undefined
 */
export function effect(fn, options = {}) {
  const effectFn = () => {
    effectStack.push(effectFn);
    activeEffect = effectStack[effectStack.length - 1];
    // 在收集依赖之前，先将当前副作用函数effectFn从所有包含EffectFn的依赖集合中清除，避免因为三元表达式之类的代码分支切换引起的副作用遗留问题
    cleanup();
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  // 存储包含该effectFn函数的依赖集合的数组: [ Set1(包含effectFn), Set2(包含effectFn), ... ]
  effectFn.deps = [];
  // 配置effectFn触发执行的时机(调度器)和其他选项
  effectFn.options = options;
  if (effectFn.options.lazy) {
    return effectFn;
  } else {
    effectFn();
  }
}

/**
 * @title 清理副作用函数
 * @description 从所有包含副作用函数的依赖集合中删除该副作用函数
 */
function cleanup() {
  activeEffect.deps.forEach((dep) => dep.delete(activeEffect));
  activeEffect.deps.length = 0;
}

/**
 * @title 追踪依赖
 * @description 对target[key]进行读取时，收集依赖副作用到target[key]对应的依赖集合
 * @param {object} target 要追踪的目标对象
 * @param {string|symbol} key 要追踪的目标对象的属性
 * @returns { undefined }
 */
export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let depsSet = depsMap.get(key);
  if (!depsSet) {
    depsMap.set(key, (depsSet = new Set()));
  }
  depsSet.add(activeEffect);
  activeEffect.deps.push(depsSet);
}

/**
 * @title 触发依赖
 * @description 触发target[key]对应的依赖函数执行
 * @param {object} target 目标对象，根据目标对象获取要触发的副作用函数
 * @param {string|symbol} key 目标对象的属性，根据目标对象的该属性可以获取要触发的副作用函数
 * @returns { undefined }
 */
export function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  effects &&
    effects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        // 被触发的effectFn不能是当前正在执行的副作用函数（否则副作用函数执行时触发副作用函数调用，会导致该副作用函数无限递归）
        effectsToRun.add(effectFn);
      }
    });
  effectsToRun &&
    effectsToRun.size > 0 &&
    effectsToRun.forEach((fn) => {
      if (fn.options.scheduler) {
        // 调度器来调度任务执行
        fn.options.scheduler(fn);
      } else {
        fn();
      }
    });
}