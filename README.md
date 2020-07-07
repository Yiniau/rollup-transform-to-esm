# rollup-transform-to-esm
transform CJS/CMD/UMD ... to ESM base on rollup and rollup/commonjs plugin

## why has this project

为啥有这个库？

我们这边在尝试基于 ESM + ShadowDOM 做类似 snowpack 的现代化模块级 technology agnostic 方案
遇到的第一个问题就是 pika CDN 的稳定性及可用性，鉴于可用性及维护上的问题，单独出一个rep来解决多种
模块规范统一转ESM的问题

## 思路

我们是先找到了 rollup/plugins/commonjs
发现会将多种格式都转换成 CJS 再转换成 ESM
那不如大胆假设只需要对 commojs plugin 的产出物进行加工，通过约定的方式解决现有 named exports 缺失的问题
将动态导出抛弃

## 分析构建结果，圈定最小改动范围

运行 `yarn run build`;

在 `build/cjs/index.js` 中我们可以看到原始的代码被包裹了 `createCommonjsHelper`

```javascript
// ...
var cjs = createCommonjsModule(function (module, exports) {
  // origin code...
});

export default cjs;
```

其他ESM模块如果通过 named exports 引用就会有报错

通过简单的搜索我们可以圈定这部分代码的注入在

__src/transform.js__ line 581 - 592

尝试将 `shouldWrap` 强制置为false

```javascript

```

## transform target

基本上有三种

```javascript
exports.xxx = 'xxx';

Object.defineProperty(exports, "xxxx", {
  enumerable: true,
  get: function get() {
    return 'xxxx';
  }
});

module.exports = {
  xxxxx: 'xxxxx'
};
```

commonjs plugin 里分别都有解析

1. `epxorts.xxx`
  __src/transform.js__
  line 405-407

  ```javascript
      // Is this an assignment to exports or module.exports?
      if (node.type === 'AssignmentExpression') {
        if (node.left.type !== 'MemberExpression') return;
  ```

2. `Object.defineProperty(exports, "xxxx", {...`
  __src/transform.js__
  line 85-102

  ```javascript
  function getDefinePropertyCallName(node, targetName) {
    if (node.type !== 'CallExpression') return;

    const {
      callee: { object, property }
    } = node;

    if (!object || object.type !== 'Identifier' || object.name !== 'Object') return;

    if (!property || property.type !== 'Identifier' || property.name !== 'defineProperty') return;

    if (node.arguments.length !== 3) return;

    const [target, val] = node.arguments;
    if (target.type !== 'Identifier' || target.name !== targetName) return;
    // eslint-disable-next-line consistent-return
    return val.value;
  }
  ```
  
3. `module.exports = ...`
  __src/transform.js__
  line 425-436

  ```javascript
  if (flattened.keypath === 'module.exports' && node.right.type === 'ObjectExpression') {
    node.right.properties.forEach((prop) => {
      if (prop.computed || !('key' in prop) || prop.key.type !== 'Identifier') return;
      const { name } = prop.key;
      if (name === makeLegalIdentifier(name)) namedExports[name] = true;
    });
    return;
  }
  ```

