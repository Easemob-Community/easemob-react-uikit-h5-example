import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenFullUikit = () => {
    navigate('/full-uikit');
  };

  const handleOpenChatroomUikit = () => {
    navigate('/chatroom-uikit');
  };

  const handleOpenCustomerService = () => {
    navigate('/customer-service');
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
              <p>模拟客服接入流程，点击问题快速进入群组对话</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="h5-footer">
        <p>环信UIKIT H5演示 © 2026</p>
      </footer>
    </div>
  );
};

export default Home;