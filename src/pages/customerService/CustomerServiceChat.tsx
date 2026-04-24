import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UIKitProvider,
  Chat,
  useClient,
  useConversationContext,
} from 'easemob-chat-uikit';
import 'easemob-chat-uikit/style.css';
import './CustomerService.css';
import { useAppStore } from '../../store/appStore';

// 客服聊天主内容
const ChatContent: React.FC<{ onBack: () => void; groupName: string }> = ({ onBack, groupName }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Chat
        headerProps={{
          back: true,
          onClickBack: onBack,
          content: groupName,
        }}
      />
    </div>
  );
};

// UIKIT 主内容
const UikitMain: React.FC<{
  userId: string;
  password: string;
  groupId: string;
  groupName: string;
  onBack: () => void;
}> = ({ userId, password, groupId, groupName, onBack }) => {
  const client = useClient();
  const { setCurrentConversation } = useConversationContext();
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const hasLogined = useRef(false);
  const hasSetConversation = useRef(false);

  // 组件挂载时执行登录
  useEffect(() => {
    if (!userId || !password || hasLogined.current) return;

    hasLogined.current = true;

    client
      .open({
        user: userId,
        pwd: password,
      })
      .then(() => {
        console.log('客服场景登录成功');
        setLoginStatus('success');
      })
      .catch((err: unknown) => {
        console.error('客服场景登录失败', err);
        setLoginStatus('error');
      });

    if (client.addEventHandler) {
      client.addEventHandler('customer-service', {
        onConnected: () => {
          console.log('客服场景已建立连接');
        },
        onDisconnected: () => {
          console.log('客服场景连接已断开');
        },
      });
    }

    return () => {
      if (client.removeEventHandler) {
        client.removeEventHandler('customer-service');
      }
    };
  }, [client, userId, password]);

  // 登录成功后，设置当前会话为客服群组
  useEffect(() => {
    if (loginStatus === 'success' && groupId && !hasSetConversation.current) {
      hasSetConversation.current = true;
      setCurrentConversation({
        conversationId: groupId,
        chatType: 'groupChat',
        name: groupName,
      });
    }
  }, [loginStatus, groupId, groupName, setCurrentConversation]);

  if (loginStatus === 'loading') {
    return (
      <div className="cs-loading-overlay">
        <div className="cs-loading-box">
          <div className="cs-loading-spinner">
            <div className="cs-spinner-ring"></div>
            <div className="cs-spinner-ring"></div>
            <div className="cs-spinner-ring"></div>
          </div>
          <div className="cs-loading-text">
            <p>正在连接客服系统...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loginStatus === 'error') {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <p style={{ color: '#ff4757' }}>登录失败，请检查客服账号配置</p>
        <button
          type="button"
          onClick={onBack}
          className="login-button"
          style={{ width: 200, marginTop: 20 }}
        >
          返回
        </button>
      </div>
    );
  }

  return <ChatContent onBack={onBack} groupName={groupName} />;
};

const CustomerServiceChat: React.FC = () => {
  const navigate = useNavigate();
  const { csAppKey, csUserId, csPassword, csGroupId } = useAppStore();

  const handleBack = () => {
    navigate('/customer-service');
  };

  // 外层给一个明确的高度容器，不使用 h5-container 避免 flex 干扰 Chat 内部布局
  return (
    <div style={{ height: '100vh', width: '100%', maxWidth: 750, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      <UIKitProvider
        theme={{ mode: 'light' }}
        initConfig={{
          appKey: csAppKey,
        }}
        local={{ lng: 'zh' }}
      >
        <UikitMain
          userId={csUserId}
          password={csPassword}
          groupId={csGroupId}
          groupName="云管家客服"
          onBack={handleBack}
        />
      </UIKitProvider>
    </div>
  );
};

export default CustomerServiceChat;
