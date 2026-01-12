# 环信UIKIT H5演示项目

这是一个基于 React + TypeScript + Vite 的移动端 H5 项目，用于展示环信UIKIT在H5环境下的使用方式。项目包含两个演示示例：完整UIKIT（单群聊功能）和Chatroom UIKIT（聊天室功能）。

## 特性

- ✅ 基于 Vite 构建，快速启动和热更新
- ✅ TypeScript 类型安全
- ✅ 移动端适配优化
- ✅ 响应式设计
- ✅ 路由系统支持多个演示页面
- ✅ 适合 H5 应用开发

## 开始使用

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

## 项目结构

- `src/App.tsx` - UIKIT Provider容器组件
- `src/AppRouter.tsx` - 应用路由配置
- `src/pages/Home.tsx` - 首页
- `src/pages/fullUikit/` - 完整UIKIT演示页面
- `src/pages/chatroomUikit/` - Chatroom UIKIT演示页面
- `src/index.css` - 全局样式，适配移动端
- `src/App.css` - 应用特定样式
- `index.html` - HTML 模板，包含移动端 meta 标签

## 移动端优化

- viewport 设置适配移动设备
- 禁用用户缩放
- 移除移动端点击高亮
- 优化滚动性能
- 适配刘海屏等异形屏
- 集成FastClick解决300ms点击延迟

## 集成说明

要集成环信UIKIT，请按如下步骤操作：

1. 安装UIKIT包：
   ```bash
   npm install easemob-uikit
   ```

2. 在App.tsx中导入并使用UIKIT Provider：
   ```tsx
   import { UIKitProvider } from 'easemob-uikit';
   
   function App({ children }: AppProps) {
     return (
       <UIKitProvider config={/* 您的配置 */}>
         {children}
       </UIKitProvider>
     );
   }
   ```

## 演示页面

- 首页：`/` - 选择演示类型的入口页面
- 完整UIKIT：`/full-uikit` - 展示单聊和群聊功能
- Chatroom UIKIT：`/chatroom-uikit` - 展示聊天室功能

## 注意事项

- 使用 rem 或 vw 单位进行布局以实现更好的适配
- 测试不同移动设备的兼容性
