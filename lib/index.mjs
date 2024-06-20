let activeEffect;
// 副作用函数执行栈，activeEffect指针永远指向栈顶
const effectStack = [];
// 记录字段与依赖的映射, target -> Map(key, value): (key:字段，value: Set<effectFn>)
const bucket = new WeakMap();

/** 注册副作用函数fn
 * 将全局指针activeEffect指向副作用函数fn, 在读取字段时通过activeEffect指针收集依赖
 * 注册函数只调用一次，用于建立对象读取与副作用函数的响应式联系
 * @param {*} fn 副作用函数
 */
export function effect(fn) {
  const effectFn = () => {
    effectStack.push(effectFn);
    activeEffect = effectStack[effectStack.length - 1];

    // 在收集依赖之前，先将当前副作用函数effectFn从所有包含EffectFn的依赖集合中清除，避免因为三元表达式之类的代码分支切换引起的副作用遗留问题
    cleanup();

    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  // 存储包含该effectFn函数的依赖集合的数组: [ Set1(包含effectFn), Set2(包含effectFn), ... ]
  effectFn.deps = [];
  effectFn();
}

function cleanup() {
  activeEffect.deps.forEach((dep) => dep.delete(activeEffect));
  activeEffect.deps.length = 0;
}

/** 追踪依赖
 * 对target[key]进行读取时，收集依赖副作用到target[key]对应的依赖集合
 * @param {*} target
 * @param {*} key
 * @returns
 */
function track(target, key) {
  // console.log("track", target, key);
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

function trigger(target, key) {
  // console.log("trigger");
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  effects.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      // 被触发的effectFn不能是当前正在执行的副作用函数（否则副作用函数执行时触发副作用函数调用，会导致该副作用函数无限递归）
      effectsToRun.add(effectFn);
    }
  });
  // console.log("trigger", effectsToRun);
  effectsToRun && effectsToRun.size > 0 && effectsToRun.forEach((fn) => fn());
}

export default function proxyData(data) {
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
