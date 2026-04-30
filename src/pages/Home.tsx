import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { getDebugInfo } from '../utils';

// uniApp webview 注入的全局对象声明
declare global {
  interface Window {
    receiveUniAppMessage?: (msg: UniAppMessage) => void;
  }
}

// uniApp 发送给 H5 的消息结构
interface UniAppMessage {
  type: string;
  data?: unknown;
}

/**
 * 客服场景选择弹窗
 */
const CustomerServicePopup: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelectBasic: () => void;
  onSelectVoice: () => void;
}> = ({ visible, onClose, onSelectBasic, onSelectVoice }) => {
  if (!visible) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">选择客服模式</h3>
          <button className="popup-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="popup-body">
          <div className="popup-option" onClick={onSelectBasic}>
            <div className="popup-option-icon">💬</div>
            <div className="popup-option-content">
              <div className="popup-option-title">基础客服</div>
              <div className="popup-option-desc">标准文本输入框，支持文字、表情、图片等</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8cdd0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <div className="popup-option" onClick={onSelectVoice}>
            <div className="popup-option-icon">🎙️</div>
            <div className="popup-option-content">
              <div className="popup-option-title">语音客服</div>
              <div className="popup-option-desc">语音优先输入框，点击录音发送语音消息</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8cdd0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showCsPopup, setShowCsPopup] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; text: string }>({
    visible: false,
    text: '',
  });
  const [envInfo, setEnvInfo] = useState<string>('检测中...');

  // 显示 toast
  const showToast = (text: string) => {
    setToast({ visible: true, text });
    setTimeout(() => {
      setToast({ visible: false, text: '' });
    }, 3000);
  };

  // 使用 uni.getEnv 检测当前运行环境
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
      Promise.resolve().then(() => setEnvInfo(`未加载uni SDK | wx=${debug.hasWx} wxMP=${debug.hasWxMiniProgram} uni=${debug.hasUni}`));
    }
  }, []);

  // 接收 uniApp 消息的回调
  useEffect(() => {
    window.receiveUniAppMessage = (msg: UniAppMessage) => {
      console.log('[H5] 收到 uniApp 消息:', msg);
      const text = `[uniApp→H5] type: ${msg.type}`;
      showToast(text);
    };

    return () => {
      delete window.receiveUniAppMessage;
    };
  }, []);

  const handleOpenFullUikit = () => {
    navigate('/full-uikit');
  };

  const handleOpenChatroomUikit = () => {
    navigate('/chatroom-uikit');
  };

  const handleOpenCustomerService = () => {
    setShowCsPopup(true);
  };

  const handleSelectBasic = () => {
    setShowCsPopup(false);
    navigate('/customer-service');
  };

  const handleSelectVoice = () => {
    setShowCsPopup(false);
    navigate('/customer-service/voice-chat');
  };

  const handleOpenUniBridge = () => {
    navigate('/uni-bridge');
  };

  return (
    <div className="h5-container">
      <header className="h5-header">
        <h1>环信UIKIT H5演示</h1>
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          运行环境: {envInfo}
        </p>
      </header>

      <main className="h5-main">
        <section className="h5-content">
          <h2>请选择演示类型</h2>
          <p>选择您想要查看的UIKIT演示示例</p>

          <div className="features">
            <div
              className="feature-item link"
              onClick={handleOpenFullUikit}
            >
              <h3>💬 完整UIKIT演示</h3>
              <p>展示单群聊功能使用方式</p>
            </div>

            <div
              className="feature-item link"
              onClick={handleOpenChatroomUikit}
            >
              <h3>🗨️ Chatroom UIKIT演示</h3>
              <p>展示聊天室功能使用方式</p>
            </div>

            <div
              className="feature-item link"
              onClick={handleOpenCustomerService}
            >
              <h3>🎧 客服场景演示</h3>
              <p>模拟客服接入流程，支持基础/语音两种模式</p>
            </div>

            <div
              className="feature-item link"
              onClick={handleOpenUniBridge}
              style={{ border: '2px dashed #007bff' }}
            >
              <h3>🌉 uni-app 跨平台通信</h3>
              <p>环境检测、消息通信、支付跳转最佳实践演示</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="h5-footer">
        <p>环信UIKIT H5演示 © 2026</p>
      </footer>

      {/* uniApp 消息 toast */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast.text}
        </div>
      )}

      <CustomerServicePopup
        visible={showCsPopup}
        onClose={() => setShowCsPopup(false)}
        onSelectBasic={handleSelectBasic}
        onSelectVoice={handleSelectVoice}
      />
    </div>
  );
};

export default Home;