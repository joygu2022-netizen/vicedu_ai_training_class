# Next.js 15 Params Fix

## 问题描述

在Next.js 15中，动态路由的 `params` 对象现在是一个 **Promise**，而不是直接的对象。这导致以下错误：

```
A param property was accessed directly with `params.id`. `params` is now a Promise and should be unwrapped with `React.use()` before accessing properties of the underlying params object.
```

## 修复方法

### 修复前（❌ 错误的方式）

```typescript
export default function RunDetail({ params }: { params: { id: string } }) {
  const runId = params.id; // 直接访问会警告
  // ...
}
```

### 修复后（✅ 正确的方式）

```typescript
import { use } from "react";

export default function RunDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: runId } = use(params); // 使用 React.use() 解包Promise
  // ...
}
```

## 关键变化

1. **导入 `use` Hook**：
   ```typescript
   import { useEffect, useState, use } from "react";
   ```

2. **更新类型定义**：
   ```typescript
   // 从
   { params: { id: string } }
   // 改为
   { params: Promise<{ id: string }> }
   ```

3. **使用 `React.use()` 解包**：
   ```typescript
   // 从
   const runId = params.id;
   // 改为
   const { id: runId } = use(params);
   ```

## 为什么会有这个变化？

Next.js 15引入这个变化是为了：

1. **更好的异步渲染** - 支持流式渲染和部分水合
2. **更快的页面加载** - 减少阻塞时间
3. **更好的用户体验** - 页面可以更快地显示内容
4. **为未来做准备** - 为React的并发特性做准备

## 兼容性

- **当前版本**：直接访问仍然支持，但会显示警告
- **未来版本**：直接访问将被完全移除，必须使用 `React.use()`

## 其他动态路由

如果项目中有其他动态路由（如 `[slug]`, `[category]` 等），也需要应用相同的修复模式。

## 测试

修复后，控制台错误应该消失，页面功能保持正常。
