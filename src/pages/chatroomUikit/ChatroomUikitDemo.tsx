import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import AppKeyModal from '../../components/AppKeyModal';
import ChatroomUIKitComponent from '../../components/chatroom/ChatroomUIKitComponent';

const ChatroomUikitDemo: React.FC = () => {
  const [showAppKeyModal, setShowAppKeyModal] = useState(true); // 默认显示弹窗
  const { appKey } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 如果已经有appKey，则隐藏弹窗
    if (appKey) {
      setShowAppKeyModal(false);
    }
  }, [appKey]);

  const handleConfirmAppKey = () => {
    setShowAppKeyModal(false);
  };

  // 如果没有appKey且没有显示修改弹窗，才显示初始设置弹窗
  if (!appKey && showAppKeyModal) {
    return (
      <AppKeyModal 
        isOpen={showAppKeyModal} 
        onClose={() => navigate('/')} // 如果关闭，则返回首页
        onConfirm={handleConfirmAppKey} 
      />
    );
  }

  // 获取当前URL路径以确定是否显示内容
  const currentPath = location.pathname;
  
  // 如果是在聊天室或成员页面，不显示这里的主内容
  if (currentPath === '/chatroom-uikit/chatroom' || currentPath === '/chatroom-uikit/members') {
    return null; // 让独立页面组件来渲染
  }

  const handleAppKeyChange = () => {
    setShowAppKeyModal(true);
  };

  return (
    <div className="h5-container">
      <header className="h5-header">
        <h1>Chatroom UIKIT演示</h1>
        <div className="app-key-display">
          <span>当前App Key: {appKey || '未设置'}</span>
          <button onClick={handleAppKeyChange} className="change-appkey-btn">
            {appKey ? '修改' : '设置'} App Key
          </button>
        </div>
        {showAppKeyModal && (
          <AppKeyModal 
            isOpen={showAppKeyModal} 
            onClose={() => setShowAppKeyModal(false)}
            onConfirm={handleConfirmAppKey} 
          />
        )}
      </header>
      
      <main className="h5-main">
        <section className="h5-content">
          <h2>聊天室功能演示</h2>
          <p>这是Chatroom UIKIT的演示页面，展示聊天室功能</p>
          
          <div className="chatroom-uikit-container">
            <ChatroomUIKitComponent />
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