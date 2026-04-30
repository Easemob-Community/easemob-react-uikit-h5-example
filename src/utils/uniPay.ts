/**
 * ============================================================================
 * H5 ↔ uni-app 微信小程序支付跳转工具
 * ============================================================================
 *
 * 【背景】
 * 1. 微信小程序 webview 中 postMessage 有延迟，消息只在 navigateBack/
 *    页面销毁等时机批量发送，无法满足实时调起支付的需求。
 * 2. uni.webview.js 在微信小程序 web-view 中，需要 window.wx.miniProgram
 *    存在才能正确映射到原生 API。若未引入微信 JS-SDK，会 fallback 到
 *    不工作的 window.parent.postMessage。
 *
 * 【方案】
 * 1. H5 同时引入 jweixin-1.6.0.js + uni.webview.js
 * 2. 三级降级策略：wx.miniProgram → window.uni → postMessage+navigateBack
 * 3. uni-app 端创建 /pages/pay/pay 页面接收参数并调起支付
 * ============================================================================
 */

// ==========================================================================
// 类型声明
// ==========================================================================

/** uni.webview.js SDK 注入的全局对象 */
export interface UniEnvResult {
  uvue?: boolean;
  nvue?: boolean;
  plus?: boolean;
  h5?: boolean;
}

export interface UniSDK {
  navigateTo: (options: { url: string }) => void;
  navigateBack: (options?: { delta?: number }) => void;
  switchTab: (options: { url: string }) => void;
  reLaunch: (options: { url: string }) => void;
  redirectTo: (options: { url: string }) => void;
  postMessage: (msg: { data: unknown }) => void;
  getEnv: (callback: (res: UniEnvResult) => void) => void;
}

/** 全局类型扩展 */
declare global {
  interface Window {
    wx?: {
      miniProgram?: {
        navigateTo?: (options: { url: string }) => void;
        navigateBack?: (options?: { delta?: number }) => void;
        switchTab?: (options: { url: string }) => void;
        reLaunch?: (options: { url: string }) => void;
        redirectTo?: (options: { url: string }) => void;
        postMessage?: (msg: { data: unknown }) => void;
        getEnv?: (callback: (res: UniEnvResult) => void) => void;
      };
    };
    uni?: UniSDK;
  }
}

/** 支付参数 */
export interface PayParams {
  /** 订单ID */
  orderId: string;
  /** 支付金额（单位：分） */
  amount: number;
  /** 商品描述 */
  description?: string;
  /** 附加数据，支付回调会原样返回 */
  attach?: string;
}

/** 支付跳转结果 */
export interface PayResult {
  success: boolean;
  method?: string;
  reason?: string;
  debug: DebugInfo;
}

/** 当前运行环境 */
export type RuntimeEnv = 'wx-miniprogram' | 'uni-app' | 'h5-browser' | 'unknown';

/** 调试信息 */
export interface DebugInfo {
  env: RuntimeEnv;
  ua: string;
  hasWx: boolean;
  hasWxMiniProgram: boolean;
  hasUni: boolean;
  hasNavigateTo: boolean;
  hasPostMessage: boolean;
  hasGetEnv: boolean;
}

// ==========================================================================
// 环境检测
// ==========================================================================

/**
 * 检测当前运行环境
 *
 * 优先级：
 * 1. 微信小程序 web-view（UA 含 miniProgram + micromessenger）
 * 2. uni-app 环境（App 端，window.uni.getEnv 存在）
 * 3. 标准 H5 浏览器
 */
export function detectEnv(): RuntimeEnv {
  const ua = navigator.userAgent;

  // 微信小程序环境（webview 内）
  if (/miniProgram/i.test(ua) && /micromessenger/i.test(ua)) {
    return 'wx-miniprogram';
  }

  // uni-app 环境（非小程序，如 App）
  if (window.uni && typeof window.uni.getEnv === 'function') {
    return 'uni-app';
  }

  // 标准浏览器
  return 'h5-browser';
}

/**
 * 获取详细的调试信息
 */
export function getDebugInfo(): DebugInfo {
  return {
    env: detectEnv(),
    ua: navigator.userAgent,
    hasWx: !!window.wx,
    hasWxMiniProgram: !!window.wx?.miniProgram,
    hasUni: !!window.uni,
    hasNavigateTo: typeof window.uni?.navigateTo === 'function',
    hasPostMessage: typeof window.uni?.postMessage === 'function',
    hasGetEnv: typeof window.uni?.getEnv === 'function',
  };
}

/** 判断是否在微信小程序 webview 中运行 */
export function isWxMiniProgram(): boolean {
  return detectEnv() === 'wx-miniprogram';
}

/** 判断是否在 uni-app App 环境中运行 */
export function isUniApp(): boolean {
  return detectEnv() === 'uni-app';
}

/** 判断是否在标准 H5 浏览器中运行 */
export function isH5Browser(): boolean {
  return detectEnv() === 'h5-browser';
}

// ==========================================================================
// 支付跳转
// ==========================================================================

/**
 * 构建小程序支付页 URL
 */
function buildPayUrl(params: PayParams): string {
  const query = new URLSearchParams({
    orderId: params.orderId,
    amount: String(params.amount),
    ...(params.description && { description: params.description }),
    ...(params.attach && { attach: params.attach }),
  });
  return `/pages/pay/pay?${query.toString()}`;
}

/**
 * 跳转到微信小程序支付页（三级降级策略）
 *
 * 【方案1】wx.miniProgram.navigateTo
 *   - 最可靠，直接调用微信原生 API
 *   - 前提：H5 已引入 jweixin-1.6.0.js
 *
 * 【方案2】window.uni.navigateTo
 *   - uni.webview.js 封装，跨平台一致
 *   - 前提：微信小程序环境下 window.wx 已存在
 *
 * 【方案3】postMessage + navigateBack
 *   - 备用方案，利用微信小程序 postMessage 批量触发的特性
 *   - 消息不会实时到达，需 navigateBack 触发发送
 */
export function navigateToWxPay(params: PayParams): PayResult {
  const env = detectEnv();
  const debug = getDebugInfo();
  const url = buildPayUrl(params);

  console.log('[uniPay] 准备跳转:', url, '环境:', env, debug);

  // ========== 方案 1: 微信小程序原生 API (最可靠) ==========
  if (window.wx?.miniProgram?.navigateTo) {
    try {
      window.wx.miniProgram.navigateTo({ url });
      console.log('[uniPay] ✅ 通过 wx.miniProgram.navigateTo 跳转');
      return { success: true, method: 'wx.miniProgram.navigateTo', debug };
    } catch (err) {
      console.error('[uniPay] wx.miniProgram.navigateTo 异常:', err);
    }
  }

  // ========== 方案 2: uni.webview.js 封装 ==========
  if (window.uni?.navigateTo) {
    try {
      window.uni.navigateTo({ url });
      console.log('[uniPay] ✅ 通过 window.uni.navigateTo 跳转');
      return { success: true, method: 'window.uni.navigateTo', debug };
    } catch (err) {
      console.error('[uniPay] window.uni.navigateTo 异常:', err);
    }
  }

  // ========== 方案 3: 备用 - postMessage + navigateBack ==========
  if (window.uni?.postMessage && window.uni?.navigateBack) {
    window.uni.postMessage({
      data: {
        type: 'navigate_to_pay',
        url,
        payload: params,
      },
    });
    // navigateBack 会触发 web-view 的 @message 事件
    setTimeout(() => {
      window.uni?.navigateBack?.();
    }, 100);
    console.log('[uniPay] ⚠️ 通过 postMessage + navigateBack 发送');
    return { success: true, method: 'postMessage+navigateBack', debug };
  }

  // 全部失败
  const reason =
    '[uniPay] 无可用跳转方式。请确认已引入微信 JS-SDK (jweixin-1.6.0.js) 和 uni.webview.js';
  console.error(reason, debug);
  return { success: false, reason, debug };
}

/**
 * 发送支付参数给小程序（备用方案：postMessage + navigateBack）
 *
 * 适用于必须通过 postMessage 传递复杂数据的场景。
 * 注意：消息不会实时到达，需配合 navigateBack 触发发送。
 */
export function postPayMessage(params: PayParams): boolean {
  if (!window.uni?.postMessage) {
    console.error('[uniPay] uni.postMessage 不可用');
    return false;
  }

  window.uni.postMessage({
    data: {
      type: 'wechat_pay',
      payload: params,
    },
  });

  console.log('[uniPay] 已发送支付消息（需 navigateBack 触发）:', params);
  return true;
}

// ==========================================================================
// 通用消息通信
// ==========================================================================

/**
 * 向宿主（uni-app / 微信小程序）发送通用消息
 *
 * @param type 消息类型
 * @param data 消息数据
 * @returns 是否发送成功
 */
export function sendMessageToHost(type: string, data: unknown): boolean {
  const message = { type, data };

  // 优先使用 uni.postMessage（兼容 App + 小程序）
  if (window.uni?.postMessage) {
    window.uni.postMessage({ data: message });
    console.log('[sendMessageToHost] 已发送 (uni.postMessage):', message);
    return true;
  }

  // 降级：CustomEvent（部分 uniApp 版本使用）
  const event = new CustomEvent('H5Message', { detail: message });
  window.dispatchEvent(event);
  console.log('[sendMessageToHost] 已发送 (CustomEvent):', message);
  return true;
}
