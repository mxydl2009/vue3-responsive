## Modules

<dl>
<dt><a href="#module_computed">computed</a></dt>
<dd><p>computed API的具体实现</p>
</dd>
<dt><a href="#module_core">core</a></dt>
<dd><p>响应式系统的核心文件,
包含了响应式系统的核心思想和方法，暴露给外部实现更加丰富的响应式功能API</p>
</dd>
<dt><a href="#module_queue">queue</a></dt>
<dd><p>任务队列的操作和刷新</p>
</dd>
<dt><a href="#module_reactive">reactive</a></dt>
<dd><p>reactive 模块，提供reactive API，将原始对象转换为响应式对象</p>
</dd>
<dt><a href="#module_ref">ref</a></dt>
<dd><p>ref 相关API的具体实现</p>
</dd>
<dt><a href="#module_watch">watch</a></dt>
<dd><p>watch API具体实现</p>
</dd>
</dl>

<a name="module_computed"></a>

## computed
computed API的具体实现

<a name="exp_module_computed--module.exports"></a>

### module.exports(getter) ⇒ <code>object</code> ⏏
计算属性的实现方案

1. 实现懒计算：在读取计算属性的值时才真正计算;
2. 实现缓存：多次读取计算属性值时，如果源值没有变化，则不需要重新计算: dirty标志位
3. 源数据变更不会立即触发getter执行，而是读取值时才触发getter执行: 源数据变更触发dirty标志位变为true

**Kind**: Exported function  
**Returns**: <code>object</code> - 计算属性返回的对象，读取该对象的value可以得到计算属性值  
**Title**: 计算属性  

| Param | Type | Description |
| --- | --- | --- |
| getter | <code>function</code> | getter函数，返回一个值(由其他响应式数据派生) |

<a name="module_core"></a>

## core
响应式系统的核心文件,
包含了响应式系统的核心思想和方法，暴露给外部实现更加丰富的响应式功能API


* [core](#module_core)
    * _static_
        * [.effect(fn)](#module_core.effect) ⇒ <code>undefined</code> \| <code>function</code>
        * [.track(target, key)](#module_core.track) ⇒ <code>undefined</code>
        * [.trigger(target, key)](#module_core.trigger) ⇒ <code>undefined</code>
    * _inner_
        * [~cleanup()](#module_core..cleanup)

<a name="module_core.effect"></a>

### core.effect(fn) ⇒ <code>undefined</code> \| <code>function</code>
将全局指针activeEffect指向副作用函数fn, 在读取字段时通过activeEffect指针收集依赖, 注册函数只调用一次，用于建立对象读取与副作用函数的响应式联系

**Kind**: static method of [<code>core</code>](#module_core)  
**Returns**: <code>undefined</code> \| <code>function</code> - 根据是否配置lazy选项而是否返回副作用函数引用还是undefined  
**Title**: 注册副作用函数fn  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | 副作用函数 |

<a name="module_core.track"></a>

### core.track(target, key) ⇒ <code>undefined</code>
对target[key]进行读取时，收集依赖副作用到target[key]对应的依赖集合

**Kind**: static method of [<code>core</code>](#module_core)  
**Title**: 追踪依赖  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>object</code> | 要追踪的目标对象 |
| key | <code>string</code> \| <code>symbol</code> | 要追踪的目标对象的属性 |

<a name="module_core.trigger"></a>

### core.trigger(target, key) ⇒ <code>undefined</code>
触发target[key]对应的依赖函数执行

**Kind**: static method of [<code>core</code>](#module_core)  
**Title**: 触发依赖  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>object</code> | 目标对象，根据目标对象获取要触发的副作用函数 |
| key | <code>string</code> \| <code>symbol</code> | 目标对象的属性，根据目标对象的该属性可以获取要触发的副作用函数 |

<a name="module_core..cleanup"></a>

### core~cleanup()
从所有包含副作用函数的依赖集合中删除该副作用函数

**Kind**: inner method of [<code>core</code>](#module_core)  
**Title**: 清理副作用函数  
<a name="module_queue"></a>

## queue
任务队列的操作和刷新


* [queue](#module_queue)
    * [.enqueue(job)](#module_queue.enqueue)
    * [.flushJob()](#module_queue.flushJob)

<a name="module_queue.enqueue"></a>

### queue.enqueue(job)
入队, 调度任务（缓存到微任务队列中）执行

**Kind**: static method of [<code>queue</code>](#module_queue)  

| Param | Type | Description |
| --- | --- | --- |
| job | <code>function</code> | 要调度执行的函数 |

<a name="module_queue.flushJob"></a>

### queue.flushJob()
刷新队列
在微任务中，将队列中的函数依次执行, 清理队列

**Kind**: static method of [<code>queue</code>](#module_queue)  
<a name="module_reactive"></a>

## reactive
reactive 模块，提供reactive API，将原始对象转换为响应式对象

<a name="exp_module_reactive--module.exports"></a>

### module.exports(data) ⇒ <code>Proxy</code> ⏏
根据原始数据生成代理对象，代理对象的读写操作会进行依赖收集和依赖触发

**Kind**: Exported function  
**Returns**: <code>Proxy</code> - 由原始数据生成的代理对象  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | 原始数据 |

<a name="module_ref"></a>

## ref
ref 相关API的具体实现


* [ref](#module_ref)
    * [module.exports(val)](#exp_module_ref--module.exports) ⇒ <code>object</code> ⏏
        * [.toRef(obj, key)](#module_ref--module.exports.toRef) ⇒ <code>object</code>
        * [.toRefs(obj)](#module_ref--module.exports.toRefs) ⇒ <code>object</code>
        * [.proxyRefs(target)](#module_ref--module.exports.proxyRefs) ⇒ <code>object</code>

<a name="exp_module_ref--module.exports"></a>

### module.exports(val) ⇒ <code>object</code> ⏏
ref函数，将原始值转换为响应式对象，通过对象的value属性操作来实现原始值的响应式

**Kind**: Exported function  
**Returns**: <code>object</code> - 转化后的响应式对象

### 用法示例
```javascript
const foo = 'foo';

const fooObj = ref(foo);

effect(() => {
  console.log(fooObj.value); // foo
});

fooObj.value = 'bar'; // 打印bar
```  
**Title**: ref function  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> \| <code>number</code> \| <code>symbol</code> \| <code>bigint</code> \| <code>boolean</code> | 原始值 |

<a name="module_ref--module.exports.toRef"></a>

#### module.exports.toRef(obj, key) ⇒ <code>object</code>
将响应式对象的属性操作（读取/写入）进行ref转换，转换后的对象可以通过解构赋值等浅拷贝操作而不会丢失响应

**Kind**: static method of [<code>module.exports</code>](#exp_module_ref--module.exports)  
**Returns**: <code>object</code> - 转换后的值  
**Title**: toRef  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | 待转换的响应式对象 |
| key | <code>string</code> \| <code>symbol</code> | 待转换的属性名 |

<a name="module_ref--module.exports.toRefs"></a>

#### module.exports.toRefs(obj) ⇒ <code>object</code>
将响应式对象obj进行ref转换，保证转换后的对象通过解构或者浅拷贝也不会丢失响应

**Kind**: static method of [<code>module.exports</code>](#exp_module_ref--module.exports)  
**Returns**: <code>object</code> - 转换后的对象

### 用法示例
```js
const obj = reactive({ foo: 'foo', bar: 'bar' });

const refObj = toRefs(obj);

console.log(refObj.foo.value); // foo

const copy = { ...refObj }; // copy.foo.value不会丢失响应
```  
**Title**: toRefs  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | 待转换的响应式对象 |

<a name="module_ref--module.exports.proxyRefs"></a>

#### module.exports.proxyRefs(target) ⇒ <code>object</code>
自动脱ref：如果访问的属性是ref对象，那么直接返回ref对象的value值

**Vue中，setup函数返回的对象会经过proxyRefs处理，所以如果返回的对象包含属性值为ref的值，就会在访问时自动脱ref**

**Kind**: static method of [<code>module.exports</code>](#exp_module_ref--module.exports)  
**Returns**: <code>object</code> - 已脱ref的对象

### 用法示例
```js
const obj = reactive({ foo: 'foo', bar: 'bar' });

const refObj = toRefs(obj); // refObj的属性都是ref对象

const decaRef = proxyRef(refObj); // 访问decaRef的属性值时不再需要加上.value了

console.log(decaRef.foo) // foo
console.log(decaRef.bar) // bar
```  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>object</code> | 待脱ref的对象 |

<a name="module_watch"></a>

## watch
watch API具体实现


* [watch](#module_watch)
    * [module.exports(source, cb)](#exp_module_watch--module.exports) ⇒ <code>undefined</code> ⏏
        * [~traverse(obj, readAlready)](#module_watch--module.exports..traverse) ⇒ <code>obj</code> \| <code>function</code> \| <code>undefined</code>

<a name="exp_module_watch--module.exports"></a>

### module.exports(source, cb) ⇒ <code>undefined</code> ⏏
侦听器: 侦听响应式数据变化并通知回调函数
通常副作用函数内部在读取属性值时会被搜集到该属性的依赖集合中，但是如果副作用函数没有触发读取操作时，就无法自动触发搜集依赖的操作;
因此，侦听器就需要手动触发搜集依赖的操作。
1. 第一种方式：递归地对source对象的属性进行手动追踪依赖，在set trap中触发cb，这种方式适合source是plain object;
2. 第二种方式：使用effect函数，传入的fn递归地读取source的属性（自动追踪依赖,因为此时的source已经是响应式数据了），options.scheduler函数调用cb，这样响应式副作用就变成了scheduler函数了;

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>object</code> \| <code>getter</code> | 被侦听的响应式数据或者getter函数 |
| cb | <code>function</code> | 数据变化触发的回调函数 |

<a name="module_watch--module.exports..traverse"></a>

#### module.exports~traverse(obj, readAlready) ⇒ <code>obj</code> \| <code>function</code> \| <code>undefined</code>
深度读取obj数据

**Kind**: inner method of [<code>module.exports</code>](#exp_module_watch--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>\*</code> | 要深度读取的数据 |
| readAlready | <code>\*</code> | 已经读取过的数据，避免因为循环引用导致的无限递归 |

