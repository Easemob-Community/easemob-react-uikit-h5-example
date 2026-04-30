/**
 * ============================================================================
 * H5 ↔ uni-app 跨平台通信最佳实践演示页面
 * ============================================================================
 *
 * 本页面演示了 H5 在 uni-app 宿主（App / 微信小程序 / 支付宝小程序）中运行时，
 * 如何进行环境检测、消息通信、页面跳转等操作。
 *
 * 配套文档：/UNIAPP_INTEGRATION.md
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  detectEnv,
  getDebugInfo,
  isWxMiniProgram,
  isUniApp,
  navigateToWxPay,
  sendMessageToHost,
  type DebugInfo,
} from '../../utils';

const UniBridgeDemo: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<string>('检测中...');
  const [toast, setToast] = useState<{ visible: boolean; text: string }>({
    visible: false,
    text: '',
  });

  // 显示 toast
  const showToast = (text: string) => {
    setToast({ visible: true, text });
    setTimeout(() => {
      setToast({ visible: false, text: '' });
    }, 4000);
  };

  // 初始化环境检测
  useEffect(() => {
    const debug = getDebugInfo();
    if (window.uni?.getEnv) {
      window.uni.getEnv((res) => {
        const env = res.uvue
          ? 'uni-app x (uvue)'
          : res.nvue
            ? 'uni-app (nvue)'
            : res.plus
              ? 'uni-app (plus)'
              : '标准 H5 浏览器';
        setEnvInfo(`${env} | wx=${debug.hasWx} wxMP=${debug.hasWxMiniProgram} uni=${debug.hasUni}`);
        console.log('[uni.getEnv] 当前环境:', res, debug);
      });
    } else {
      Promise.resolve().then(() =>
        setEnvInfo(`未加载uni SDK | wx=${debug.hasWx} wxMP=${debug.hasWxMiniProgram} uni=${debug.hasUni}`)
      );
    }
  }, []);

  // 复制调试信息到剪贴板
  const handleCopyDebug = async () => {
    const debug = getDebugInfo();
    const text = JSON.stringify(debug, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      showToast('调试信息已复制到剪贴板');
    } catch {
      showToast(text);
    }
  };

  // 测试发送消息到宿主
  const handleTestMessage = () => {
    const success = sendMessageToHost('test', {
      message: 'Hello from H5!',
      timestamp: Date.now(),
    });
    showToast(success ? '消息已发送（见控制台）' : '发送失败');
  };

  // 测试跳转到支付页
  const handleTestPay = () => {
    const result = navigateToWxPay({
      orderId: `TEST_${Date.now()}`,
      amount: 1,
      description: 'H5测试支付-1分钱',
    });

    if (!result.success) {
      const debugText = `环境: ${result.debug.env}
wx存在: ${result.debug.hasWx}
wx.miniProgram: ${result.debug.hasWxMiniProgram}
window.uni: ${result.debug.hasUni}
navigateTo: ${result.debug.hasNavigateTo}`;
      console.error('[支付跳转失败]', result.reason, result.debug);
      showToast(`跳转失败: ${result.reason}\n${debugText}`);
    } else {
      showToast(`✅ 已触发跳转 (${result.method})`);
    }
  };

  // 测试环境检测
  const handleTestEnv = () => {
    const env = detectEnv();
    const isWx = isWxMiniProgram();
    const isUni = isUniApp();
    showToast(`环境: ${env}\n是微信小程序: ${isWx}\n是uniApp: ${isUni}`);
  };

  return (
    <div className="uni-bridge-demo" style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>🌉 uni-app 跨平台通信演示</h1>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>
        运行环境: {envInfo}
      </p>

      {/* 环境检测卡片 */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>🔍 环境检测</h2>
        <p style={descStyle}>检测当前 H5 运行在哪个宿主环境中</p>
        <button style={btnStyle} onClick={handleTestEnv}>
          检测环境
        </button>
        <button style={{ ...btnStyle, background: '#6c757d' }} onClick={handleCopyDebug}>
          复制调试信息
        </button>
      </section>

      {/* 消息通信卡片 */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>📡 消息通信</h2>
        <p style={descStyle}>
          向 uni-app 宿主发送消息（小程序中 postMessage 不实时，仅在返回/分享时触发）
        </p>
        <button style={{ ...btnStyle, background: '#ff6b6b' }} onClick={handleTestMessage}>
          发送测试消息
        </button>
      </section>

      {/* 支付跳转卡片 */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>💳 支付跳转</h2>
        <p style={descStyle}>
          跳转到小程序原生支付页（需 uni-app 端配合注册 /pages/pay/pay）
        </p>
        <button style={{ ...btnStyle, background: '#07c160' }} onClick={handleTestPay}>
          测试支付跳转（1分钱）
        </button>
      </section>

      {/* 说明卡片 */}
      <section style={{ ...sectionStyle, background: '#f8f9fa' }}>
        <h2 style={titleStyle}>📖 配套说明</h2>
        <ul style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
          <li>本页面依赖 <code>uni.webview.js</code> + <code>jweixin-1.6.0.js</code></li>
          <li>在 App 端运行时，通过 <code>window.uni.navigateTo</code> 通信</li>
          <li>在微信小程序端，通过 <code>wx.miniProgram.navigateTo</code> 通信</li>
          <li>详见项目根目录 <code>UNIAPP_INTEGRATION.md</code></li>
        </ul>
      </section>

      {/* Toast */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: 8,
            fontSize: 14,
            whiteSpace: 'pre-wrap',
            maxWidth: '80vw',
            wordBreak: 'break-all',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};

// 样式常量
const sectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 8,
};

const descStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#666',
  marginBottom: 16,
};

const btnStyle: React.CSSProperties = {
  background: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontSize: 14,
  cursor: 'pointer',
  marginRight: 10,
  marginBottom: 8,
};

export default UniBridgeDemo;
