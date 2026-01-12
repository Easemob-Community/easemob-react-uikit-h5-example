# H5项目模板

这是一个基于 React + TypeScript + Vite 的移动端 H5 项目模板，已预配置适合移动端的样式和设置。

## 特性

- ✅ 基于 Vite 构建，快速启动和热更新
- ✅ TypeScript 类型安全
- ✅ 移动端适配优化
- ✅ 响应式设计
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

- `src/App.tsx` - 主应用组件
- `src/index.css` - 全局样式，适配移动端
- `src/App.css` - 应用特定样式
- `index.html` - HTML 模板，包含移动端 meta 标签

## 移动端优化

- viewport 设置适配移动设备
- 禁用用户缩放
- 移除移动端点击高亮
- 优化滚动性能
- 适配刘海屏等异形屏

## 注意事项

- 使用 rem 或 vw 单位进行布局以实现更好的适配
- 考虑添加 fastclick 库解决移动端 300ms 延迟
- 测试不同移动设备的兼容性
