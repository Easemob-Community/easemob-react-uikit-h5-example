import React, { useState } from 'react';
import { observer } from "mobx-react-lite";
import "easemob-chat-uikit/style.css";
import { useAppStore } from '../../store/appStore';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatroomUIKitComponent: React.FC = observer(() => {
  const { userId, token, chatroomId, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  

  
  // 从全局状态获取用户信息
  const [localUserId, setLocalUserId] = useState(userId);
  const [localToken, setLocalToken] = useState(token);
  const [localChatroomId, setLocalChatroomId] = useState(chatroomId);
  
  // 从URL参数或状态中获取当前页面
  const currentPage = location.pathname.split('/').pop() || 'login';
  
  const login = () => {
    // 保存用户信息到全局store
    setUserInfo(localUserId, localToken, localChatroomId);
    
    // 在跳转到聊天室页面后，UIKIT组件会处理登录逻辑
    // 这样可以确保在正确的UIKitProvider上下文中执行
    navigate('/chatroom-uikit/chatroom');
  };

  // 渲染登录页面
  const renderLoginPage = () => (
    <div className="chatroom-app-container">
      <div className="login-section">
        <div className="input-group">
          <label>用户ID</label>
          <input
            type="text"
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
            placeholder="请输入用户ID"
            className="input-field"
          />
        </div>
        <div className="input-group">
          <label>Token</label>
          <input
            type="password"
            value={localToken}
            onChange={(e) => setLocalToken(e.target.value)}
            placeholder="请输入Token"
            className="input-field"
          />
        </div>
        <div className="input-group">
          <label>聊天室ID</label>
          <input
            type="text"
            value={localChatroomId}
            onChange={(e) => setLocalChatroomId(e.target.value)}
            placeholder="请输入聊天室ID"
            className="input-field"
          />
        </div>
        <button onClick={login} className="login-button">
          登录
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {currentPage === 'login' || !currentPage || currentPage === 'chatroom-uikit' 
        ? renderLoginPage() 
        : null}
    </div>
  );
});

export default ChatroomUIKitComponent;