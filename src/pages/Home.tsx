import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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

  return (
    <div className="h5-container">
      <header className="h5-header">
        <h1>环信UIKIT H5演示</h1>
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
          </div>
        </section>
      </main>

      <footer className="h5-footer">
        <p>环信UIKIT H5演示 © 2026</p>
      </footer>

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