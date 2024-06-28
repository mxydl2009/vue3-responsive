/**
 * @file
 * ref 相关API的具体实现
 *
 * @module ref
 *
 */
import reactive from "./reactive.js";

/**
 * @title ref function
 * @description
 * ref函数，将原始值转换为响应式对象，通过对象的value属性操作来实现原始值的响应式
 * @param {string|number|symbol|bigint|boolean} val 原始值
 * @returns {object} 转化后的响应式对象
 *
 * ### 用法示例
 * ```javascript
 * const foo = 'foo';
 *
 * const fooObj = ref(foo);
 *
 * effect(() => {
 *   console.log(fooObj.value); // foo
 * });
 *
 * fooObj.value = 'bar'; // 打印bar
 * ```
 */
export default function ref(val) {
  const obj = {
    value: val,
  };
  const reactiveObj = reactive(obj);

  // 添加是否为ref包装后的响应式对象
  Object.defineProperty(reactiveObj, "__is_vue_ref", {
    value: true,
  });

  return reactiveObj;
}

/**
 * @title toRef
 * @description 将响应式对象的属性操作（读取/写入）进行ref转换，转换后的对象可以通过解构赋值等浅拷贝操作而不会丢失响应
 * @param {object} obj 待转换的响应式对象
 * @param {string|symbol} key 待转换的属性名
 * @returns {object} 转换后的值
 */
export function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
    set value(val) {
      return (obj[key] = val);
    },
  };

  Object.defineProperty(wrapper, "__is_vue_ref", {
    value: true,
  });

  return wrapper;
}

/**
 * @title toRefs
 * @description 将响应式对象obj进行ref转换，保证转换后的对象通过解构或者浅拷贝也不会丢失响应
 * @param {object} obj 待转换的响应式对象
 * @return {object} 转换后的对象
 *
 * ### 用法示例
 * ```js
 * const obj = reactive({ foo: 'foo', bar: 'bar' });
 *
 * const refObj = toRefs(obj);
 *
 * console.log(refObj.foo.value); // foo
 *
 * const copy = { ...refObj }; // copy.foo.value不会丢失响应
 * ```
 */
export function toRefs(obj) {
  const wrapper = {};
  for (let key in obj) {
    wrapper[key] = toRef(obj, key);
  }
  Object.defineProperty(wrapper, "__is_vue_ref", {
    value: true,
  });
  return wrapper;
}

// 自动脱ref：如果访问的属性是ref对象，那么直接返回ref对象的value值
/**
 * @description
 * 自动脱ref：如果访问的属性是ref对象，那么直接返回ref对象的value值
 *
 * **Vue中，setup函数返回的对象会经过proxyRefs处理，所以如果返回的对象包含属性值为ref的值，就会在访问时自动脱ref**
 * @param {object} target 待脱ref的对象
 * @returns {object} 已脱ref的对象
 *
 * ### 用法示例
 * ```js
 * const obj = reactive({ foo: 'foo', bar: 'bar' });
 *
 * const refObj = toRefs(obj); // refObj的属性都是ref对象
 *
 * const decaRef = proxyRef(refObj); // 访问decaRef的属性值时不再需要加上.value了
 *
 * console.log(decaRef.foo) // foo
 * console.log(decaRef.bar) // bar
 * ```
 */
export function proxyRefs(target) {
  return new Proxy(target, {
    get() {
      const value = Reflect.get(...arguments);
      return value.__is_vue_ref ? value.value : value;
    },
    set(target, key, val) {
      const value = target[key];
      if (value.__is_vue_ref) {
        value.value = val;
        return true;
      }
      return Reflect.set(...arguments);
    },
  });
}
