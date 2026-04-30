/**
 * ============================================================================
 * H5 ↔ uni-app 跨平台通信工具库统一入口
 * ============================================================================
 *
 * 设计目标：让同一套 H5 代码，能在以下环境中运行：
 *  1. uni-app 编译的 App（5+ App / uvue / nvue）
 *  2. 微信小程序 web-view
 *  3. 支付宝小程序 web-view
 *  4. 标准 H5 浏览器
 *
 * 核心依赖：
 *  - uni.webview.js  （DCloud 提供，跨平台桥接）
 *  - jweixin-1.6.0.js（微信官方 JS-SDK，补齐微信小程序桥接）
 *
 * 使用方式：
 *  import { navigateToWxPay, detectEnv, sendMessageToHost, getDebugInfo } from '@/utils';
 * ============================================================================
 */

export {
  // 支付跳转
  navigateToWxPay,
  postPayMessage,
  type PayParams,
  type PayResult,

  // 环境检测
  detectEnv,
  getDebugInfo,
  isWxMiniProgram,
  isUniApp,
  isH5Browser,
  type RuntimeEnv,
  type DebugInfo,

  // 通用消息通信
  sendMessageToHost,
} from './uniPay';
