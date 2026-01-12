import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import AppKeyModal from '../../components/AppKeyModal';

const ChatroomUikitDemo: React.FC = () => {
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
        <h1>Chatroom UIKIT演示</h1>
      </header>
      
      <main className="h5-main">
        <section className="h5-content">
          <h2>聊天室功能演示</h2>
          <p>这是Chatroom UIKIT的演示页面，展示聊天室功能</p>
          
          <div className="features">
            <div className="feature-item">
              <h3>💬 大型聊天室</h3>
              <p>支持大量用户同时在线的聊天室</p>
            </div>
            
            <div className="feature-item">
              <h3>🎤 聊天室权限</h3>
              <p>管理员、发言者、听众等不同权限角色</p>
            </div>
            
            <div className="feature-item">
              <h3>📊 实时互动</h3>
              <p>实时消息、弹幕、礼物等互动功能</p>
            </div>
          </div>
          
          <div className="demo-placeholder">
            <p>这里将集成环信Chatroom UIKIT组件</p>
            {/* 这里将放置实际的Chatroom UIKIT组件 */}
          </div>
        </section>
      </main>
      
      <footer className="h5-footer">
        <Link to="/">返回首页</Link>
      </footer>
    </div>
  );
};

export default ChatroomUikitDemo;