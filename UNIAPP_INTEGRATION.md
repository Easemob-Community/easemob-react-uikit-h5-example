# H5 ↔ uni-app 跨平台互通集成指南

> 本文档面向 **H5 前端开发者** 和 **uni-app 开发者**，说明 H5 页面嵌入 uni-app 宿主（App / 微信小程序 / 支付宝小程序）时，双方需要配合编写的代码。

---

## 一、H5 侧需要做什么

### 1.1 引入两个 JS SDK（必须）

在 `index.html` 的 `</body>` 前按顺序引入：

```html
<!-- 1. 微信官方 JS-SDK：为微信小程序 web-view 注入 window.wx.miniProgram -->
<script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>

<!-- 2. DCloud uni.webview.js：跨平台桥接层，统一 window.uni API -->
<script src="/uni.webview.1.5.6.js"></script>
```

> ⚠️ **顺序很重要**：微信 JS-SDK 必须在 `uni.webview.js` **之前**加载。
> 因为 `uni.webview.js` 的平台检测依赖 `window.wx` 是否存在。

> 📌 **为什么需要同时引入两者？**
> - `uni.webview.js` 的设计目标是**跨平台一致性**——同一套 H5 代码既能跑在 uni-app App 端，也能跑在微信/支付宝小程序 web-view 中
> - 但在**微信小程序 web-view** 中，它依赖 `window.wx.miniProgram` 做平台映射。若 `window.wx` 不存在，会 fallback 到不工作的 `window.parent.postMessage`
> - 微信 JS-SDK 负责向 H5 注入 `window.wx` 对象，补齐这个前提条件

### 1.2 使用封装好的工具函数

```ts
import {
  navigateToWxPay,   // 跳转支付页
  sendMessageToHost, // 发送消息
  detectEnv,         // 检测环境
  getDebugInfo,      // 获取调试信息
} from '@/utils';

// 跳转支付页
navigateToWxPay({
  orderId: 'ORDER_123',
  amount: 100,        // 1元 = 100分
  description: '测试商品',
});

// 发送消息
sendMessageToHost('custom_event', { foo: 'bar' });

// 检测环境
console.log(detectEnv()); // 'wx-miniprogram' | 'uni-app' | 'h5-browser'
```

### 1.3 工具 API 说明

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `navigateToWxPay` | `{ orderId, amount, description?, attach? }` | `{ success, method?, reason?, debug }` | 三级降级跳转支付页 |
| `sendMessageToHost` | `(type, data)` | `boolean` | 向宿主发送通用消息 |
| `detectEnv` | - | `'wx-miniprogram' \| 'uni-app' \| 'h5-browser'` | 检测运行环境 |
| `getDebugInfo` | - | `DebugInfo` | 获取详细调试信息 |
| `isWxMiniProgram` | - | `boolean` | 是否微信小程序 |
| `isUniApp` | - | `boolean` | 是否 uni-app App |

---

## 二、uni-app 侧需要做什么

### 2.1 注册 web-view 承载页

创建 `pages/login/login.vue`（或任意页面），用 `<web-view>` 加载 H5：

```vue
<template>
  <view class="container">
    <web-view
      src="https://your-h5-domain.com/"
      @message="handleMessage"
      @error="handleError"
    />
  </view>
</template>

<script setup>
// 接收 H5 通过 postMessage 发来的消息
const handleMessage = (event) => {
  const data = event.detail.data;
  console.log('>>> 收到 H5 消息:', data);

  // 处理备用方案的 postMessage 指令
  const lastMsg = Array.isArray(data) ? data[data.length - 1] : data;
  if (lastMsg?.type === 'navigate_to_pay' && lastMsg?.url) {
    uni.navigateTo({ url: lastMsg.url });
    return;
  }

  uni.showModal({
    title: '收到 H5 消息',
    content: JSON.stringify(data, null, 2),
    showCancel: false,
  });
};

const handleError = (event) => {
  console.error('web-view 加载失败:', event);
};
</script>
```

### 2.2 注册支付页

创建 `pages/pay/pay.vue`：

```vue
<template>
  <view class="pay-page">
    <view class="pay-card">
      <text class="pay-title">确认支付</text>
      <text class="pay-amount">¥{{ (amount / 100).toFixed(2) }}</text>
      <text class="pay-desc">{{ description }}</text>
      <button @click="handlePay">立即支付</button>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const orderId = ref('');
const amount = ref(0);
const description = ref('');

onLoad((options) => {
  orderId.value = options.orderId || '';
  amount.value = parseInt(options.amount) || 0;
  description.value = decodeURIComponent(options.description || '');
});

const handlePay = () => {
  // 1. 调用后端获取微信支付参数
  uni.request({
    url: 'https://your-api.com/wxpay/create',
    method: 'POST',
    data: { orderId: orderId.value, amount: amount.value },
    success: (res) => {
      const { prepayId, nonceStr, timeStamp, signType, paySign } = res.data;

      // 2. 调起微信支付（微信小程序格式）
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: String(timeStamp),
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: signType || 'RSA',
        paySign,
        success: () => {
          uni.showToast({ title: '支付成功', icon: 'success' });
          setTimeout(() => uni.navigateBack(), 1500);
        },
        fail: (err) => {
          uni.showToast({ title: '支付取消或失败', icon: 'none' });
        },
      });
    },
  });
};
</script>
```

### 2.3 在 pages.json 中注册页面

```json
{
  "pages": [
    {
      "path": "pages/login/login",
      "style": {
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/pay/pay",
      "style": {
        "navigationBarTitleText": "支付"
      }
    }
  ]
}
```

> ⚠️ **注意**：修改 `pages.json` 后必须**重新编译**整个项目，热更新不生效。

---

## 三、通信机制对照表

| 场景 | H5 端代码 | uni-app 端代码 | 实时性 | 备注 |
|------|-----------|----------------|--------|------|
| 实时跳转 | `navigateToWxPay()` | 注册目标页面 | ✅ 实时 | 推荐方案 |
| 通用消息 | `sendMessageToHost()` | `@message="handleMessage"` | ❌ 延迟 | 仅在返回/分享/销毁时触发 |
| 备用跳转 | `postMessage` + `navigateBack` | `@message` 解析 `navigate_to_pay` | ⚠️ 半实时 | 需要 H5 触发返回 |
| URL 传参 | `navigateTo({ url: '/pages/pay?a=1' })` | `onLoad(options)` 接收 | ✅ 实时 | 数据量受限 |

---

## 四、常见问题

### Q1: H5 调用 `window.uni.navigateTo` 后小程序没反应？

**检查清单：**
1. ✅ `index.html` 是否引入了 `jweixin-1.6.0.js`（必须在 `uni.webview.js` 之前）
2. ✅ `window.wx` 是否存在？在 H5 控制台输入 `!!window.wx` 检查
3. ✅ `pages.json` 是否注册了目标页面？修改后是否重新编译？
4. ✅ 小程序 web-view 的 `src` 域名是否在微信小程序后台配置了业务域名？

### Q2: 为什么 App 端正常，微信小程序不行？

`uni.webview.js` 在 **App 端** 通过 `plus.webview` 通信，在 **微信小程序端** 通过 `wx.miniProgram` 通信。
App 端自动注入 `plus` 对象，而微信小程序不会自动注入 `wx`，需要手动引入微信 JS-SDK。

### Q3: `uni.requestPayment` 在小程序中报错？

微信小程序的 `uni.requestPayment` 参数格式与 App 端不同：
- ❌ 错误（App 格式）：`orderInfo: { appid, partnerid, prepayid, ... }`
- ✅ 正确（小程序格式）：`timeStamp, nonceStr, package, signType, paySign` 直接放顶层

---

## 五、文件对应关系

```
H5 项目
├── index.html              ← 引入 jweixin + uni.webview.js
├── src/
│   ├── utils/
│   │   ├── index.ts        ← 统一入口，导出所有工具
│   │   └── uniPay.ts       ← 核心工具：跳转、检测、通信
│   ├── pages/
│   │   └── uniBridge/
│   │       └── UniBridgeDemo.tsx  ← 演示页面
│   └── AppRouter.tsx       ← 注册 /uni-bridge 路由
└── UNIAPP_INTEGRATION.md   ← 本文档

uni-app 项目
├── pages/
│   ├── login/login.vue     ← web-view 承载页
│   └── pay/pay.vue         ← 支付页（接收参数、调起支付）
└── pages.json              ← 注册 login + pay 页面
```

---

## 六、快速验证

1. 打开 H5 页面，顶部环境信息应显示：
   ```
   运行环境: wx-miniprogram | wx=true wxMP=true uni=true
   ```
2. 点击"检测环境"按钮，toast 显示 `wx-miniprogram`
3. 点击"测试支付跳转"，toast 显示 `✅ 已触发跳转 (wx.miniProgram.navigateTo)`
4. 小程序端正常打开支付页，显示金额和支付按钮
