import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import AppKeyModal from '../../components/AppKeyModal';

const FullUikitDemo: React.FC = () => {
  const [showAppKeyModal, setShowAppKeyModal] = useState(true); // 默认显示弹窗
  const { appKey } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经有appKey，则隐藏弹窗
    if (appKey) {
      setShowAppKeyModal(false);
    }
  }, [appKey]);

  const handleConfirmAppKey = () => {
    setShowAppKeyModal(false);
  };

  // 如果没有appKey，只显示弹窗
  if (!appKey) {
    return (
      <AppKeyModal 
        isOpen={showAppKeyModal} 
        onClose={() => navigate('/')} // 如果关闭，则返回首页
        onConfirm={handleConfirmAppKey} 
      />
    );
  }

  return (
    <div className="h5-container">
      <header className="h5-header">
        <h1>完整UIKIT演示</h1>
      </header>
      
      <main className="h5-main">
        <section className="h5-content">
          <h2>单群聊功能演示</h2>
          <p>这是完整UIKIT的演示页面，展示单聊和群聊功能</p>
          
          <div className="features">
            <div className="feature-item">
              <h3>👤 单聊功能</h3>
              <p>一对一私聊消息交互</p>
            </div>
            
            <div className="feature-item">
              <h3>👥 群聊功能</h3>
              <p>多人群组消息交互</p>
            </div>
            
            <div className="feature-item">
              <h3>📁 消息类型</h3>
              <p>文本、图片、语音、视频等多种消息格式</p>
            </div>
          </div>
          
          <div className="demo-placeholder">
            <p>这里将集成环信完整UIKIT组件</p>
            {/* 这里将放置实际的UIKIT组件 */}
          </div>
        </section>
      </main>
      
      <footer className="h5-footer">
        <Link to="/">返回首页</Link>
      </footer>
    </div>
  );
};

export default FullUikitDemo;