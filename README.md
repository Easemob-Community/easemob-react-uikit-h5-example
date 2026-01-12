# 环信UIKIT H5演示项目

这是一个基于 React + TypeScript + Vite 的移动端 H5 项目，用于展示环信UIKIT在H5环境下的使用方式。项目包含两个演示示例：完整UIKIT（单群聊功能）和Chatroom UIKIT（聊天室功能）。

## 特性

- ✅ 基于 Vite 构建，快速启动和热更新
- ✅ TypeScript 类型安全
- ✅ 移动端适配优化
- ✅ 响应式设计
- ✅ 路由系统支持多个演示页面
- ✅ 适合 H5 应用开发
- ✅ 状态管理集成，支持数据持久化
- ✅ 组件模块化设计，便于维护

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
- `src/components/chatroom/` - 聊天室相关组件集中存放目录
- `src/store/appStore.ts` - 全局状态管理，支持数据持久化
- `src/index.css` - 全局样式，适配移动端
- `src/App.css` - 应用特定样式
- `index.html` - HTML 模板，包含移动端 meta 标签

## Chatroom UIKIT 使用指南

### 功能介绍

Chatroom UIKIT 提供了完整的聊天室功能，包括：

- 🗣️ 实时聊天功能
- 👥 聊天室成员管理
- 🔐 用户身份认证
- 💾 数据持久化存储
- 📱 移动端适配优化
- 🔄 自动重连机制

### 页面路由

- `/chatroom-uikit` - 聊天室功能入口页面
- `/chatroom-uikit/chatroom` - 聊天室主界面
- `/chatroom-uikit/members` - 聊天室成员列表

### 使用流程

1. 访问 `/chatroom-uikit` 页面
2. 配置 App Key（支持持久化存储）
3. 输入用户ID、Token 和 聊天室ID
4. 点击登录进入聊天室
5. 在聊天室页面可切换至成员列表页面

### 技术特性

- **状态管理**：使用 Zustand + Middleware 实现全局状态管理，支持 localStorage 持久化
- **组件分离**：聊天室核心组件独立封装，便于复用和维护
- **UIKIT集成**：使用 UIKitProvider 统一管理主题和配置
- **路由控制**：通过 React Router 实现页面间导航
- **事件处理**：集成连接状态监听和错误处理机制

### 组件结构

- `ChatroomUIKitComponent` - 聊天室登录和用户信息管理组件
- `ChatroomEntryPoint` - 聊天室入口组件，根据路由渲染不同内容
- `ChatroomPageContent` - 聊天室主界面内容组件
- `ChatroomMemberPageContent` - 聊天室成员界面内容组件

### 数据持久化

用户输入的认证信息（appKey、userId、token、chatroomId）会被自动保存到 localStorage 中，下次访问时无需重复输入。

### 国际化支持

UIKIT 内置多语言支持，默认使用中文（zh）语言包。

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
   npm install easemob-chat-uikit
   ```

2. 在App.tsx中导入并使用UIKIT Provider：
   ```tsx
   import { UIKitProvider } from 'easemob-chat-uikit';
   
   function App({ children }: AppProps) {
     return (
       <UIKitProvider
         theme={{ mode: "light" }}
         initConfig={{ appKey: "your-app-key" }}
         local={{ lng: "zh" }}>
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
- 确保网络连接稳定以获得最佳体验
- 生产环境中请妥善保管 App Key 和 Token 信息
