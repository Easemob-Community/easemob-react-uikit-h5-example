import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UIKitProvider,
  ConversationList,
  Chat,
  ContactList,
  ContactDetail,
  useClient,
  useConversationContext,
} from 'easemob-chat-uikit';
import 'easemob-chat-uikit/style.css';
import { useAppStore } from '../../store/appStore';
import AppKeyModal from '../../components/AppKeyModal';
import type { Conversation } from 'easemob-chat-uikit/types/module/store/ConversationStore';

// 登录表单组件
const LoginForm: React.FC<{
  onLogin: (appKey: string, userId: string, password: string) => void;
}> = ({ onLogin }) => {
  const [appKeyInput, setAppKeyInput] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appKeyInput.trim()) {
      setError('请输入 AppKey');
      return;
    }
    if (!userIdInput.trim()) {
      setError('请输入 UserId');
      return;
    }
    if (!passwordInput.trim()) {
      setError('请输入 Password');
      return;
    }
    setError('');
    onLogin(appKeyInput.trim(), userIdInput.trim(), passwordInput.trim());
  };

  return (
    <div className="chatroom-app-container">
      <form onSubmit={handleSubmit} className="login-section">
        <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>
          单群聊 UIKIT 登录
        </h2>
        {error && (
          <p style={{ color: '#ff4757', textAlign: 'center', marginBottom: 10 }}>
            {error}
          </p>
        )}
        <div className="input-group">
          <label>AppKey</label>
          <input
            type="text"
            value={appKeyInput}
            onChange={(e) => setAppKeyInput(e.target.value)}
            placeholder="请输入 AppKey"
            className="input-field"
          />
        </div>
        <div className="input-group">
          <label>用户ID</label>
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="请输入用户ID"
            className="input-field"
          />
        </div>
        <div className="input-group">
          <label>密码</label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="请输入密码"
            className="input-field"
          />
        </div>
        <button type="submit" className="login-button">
          登录
        </button>
      </form>
    </div>
  );
};

// 聊天页面内容
const ChatContent: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="top-navigation">
        <button type="button" onClick={onBack} className="back-button" style={{ color: 'black' }}>
          ← 返回
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Chat />
      </div>
    </div>
  );
};

// 会话列表页面内容
const ConversationContent: React.FC<{ onEnterChat: () => void }> = ({ onEnterChat }) => {
  const { setCurrentConversation } = useConversationContext();

  const handleItemClick = useCallback(
    (data: Conversation) => {
      setCurrentConversation({
        conversationId: data.conversationId,
        chatType: data.chatType,
        name: data.name,
      });
      onEnterChat();
    },
    [setCurrentConversation, onEnterChat]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="top-navigation">
        <span style={{ fontWeight: 500, color: '#333' }}>会话</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ConversationList onItemClick={handleItemClick} />
      </div>
    </div>
  );
};

// 联系人页面内容
const ContactContent: React.FC<{ onEnterChat: () => void }> = ({ onEnterChat }) => {
  const [selectedContact, setSelectedContact] = useState<
    | { id: string; name: string; type: 'contact' | 'group' }
    | { id: string; name: string; type: 'request'; requestStatus: 'pending' | 'read' | 'accepted' }
    | null
  >(null);
  const { setCurrentConversation } = useConversationContext();

  const handleItemClick = useCallback(
    (info: { id: string; type: 'contact' | 'group' | 'request'; name: string }) => {
      if (info.type === 'request') {
        setSelectedContact({
          id: info.id,
          name: info.name,
          type: info.type,
          requestStatus: 'pending',
        });
      } else {
        setSelectedContact({ id: info.id, name: info.name, type: info.type });
      }
    },
    [setSelectedContact]
  );

  const handleMessageBtnClick = useCallback(() => {
    if (selectedContact && (selectedContact.type === 'contact' || selectedContact.type === 'group')) {
      setCurrentConversation({
        conversationId: selectedContact.id,
        chatType: selectedContact.type === 'group' ? 'groupChat' : 'singleChat',
        name: selectedContact.name,
      });
      onEnterChat();
    }
  }, [selectedContact, setCurrentConversation, onEnterChat]);

  if (selectedContact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="top-navigation">
          <button
            type="button"
            onClick={() => setSelectedContact(null)}
            className="back-button"
            style={{ color: 'black' }}
          >
            ← 返回
          </button>
          <span style={{ fontWeight: 500, color: '#333' }}>详情</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ContactDetail
            data={selectedContact}
            back={false}
            onClickBack={() => setSelectedContact(null)}
            onMessageBtnClick={handleMessageBtnClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="top-navigation">
        <span style={{ fontWeight: 500, color: '#333' }}>联系人</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ContactList onItemClick={handleItemClick} />
      </div>
    </div>
  );
};

// 我的页面内容
const MeContent: React.FC<{ userId: string; onLogout: () => void }> = ({ userId, onLogout }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="top-navigation">
        <span style={{ fontWeight: 500, color: '#333' }}>我的</span>
      </div>
      <div style={{ flex: 1, padding: 20, background: '#f5f5f5' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              background: '#007AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            {userId.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>{userId}</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>在线</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', fontSize: 14, color: '#666' }}>
            设置
          </div>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', fontSize: 14, color: '#666' }}>
            关于
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="login-button"
          style={{ backgroundColor: '#ff4757' }}
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

// TabBar 组件
const TabBar: React.FC<{
  activeTab: 'conversation' | 'contact' | 'me';
  onTabChange: (tab: 'conversation' | 'contact' | 'me') => void;
  unreadCount?: number;
}> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  const tabs: { key: 'conversation' | 'contact' | 'me'; label: string; icon: string }[] = [
    { key: 'conversation', label: '会话', icon: '💬' },
    { key: 'contact', label: '联系人', icon: '👥' },
    { key: 'me', label: '我的', icon: '👤' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: 56,
        borderTop: '1px solid #e5e5e5',
        background: '#fff',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 12,
                color: isActive ? '#007AFF' : '#999',
              }}
            >
              {tab.label}
            </span>
            {tab.key === 'conversation' && unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: '30%',
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: '#ff4757',
                  color: '#fff',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// UIKIT 主内容（参考 Chatroom UIKIT 登录方式）
const UikitMain: React.FC<{
  userId: string;
  password: string;
  onLogout: () => void;
}> = ({ userId, password, onLogout }) => {
  const client = useClient();
  const [activeTab, setActiveTab] = useState<'conversation' | 'contact' | 'me'>('conversation');
  const [isInChat, setIsInChat] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const hasLogined = useRef(false);

  // 组件挂载时执行登录（参考 Chatroom UIKIT）
  useEffect(() => {
    if (!userId || !password || hasLogined.current) return;

    hasLogined.current = true;

    client
      .open({
        user: userId,
        pwd: password,
      })
      .then(() => {
        console.log('登录成功');
        setLoginStatus('success');
      })
      .catch((err: unknown) => {
        console.error('登录失败', err);
        setLoginStatus('error');
      });

    // 设置事件处理器（参考 Chatroom UIKIT）
    if (client.addEventHandler) {
      client.addEventHandler('full-uikit', {
        onConnected: () => {
          console.log('已建立连接');
        },
        onDisconnected: () => {
          console.log('连接已断开');
        },
      });
    }

    // 清理事件处理器（参考 Chatroom UIKIT）
    return () => {
      if (client.removeEventHandler) {
        client.removeEventHandler('full-uikit');
      }
    };
  }, [client, userId, password]);

  const handleEnterChat = useCallback(() => {
    setIsInChat(true);
  }, []);

  const handleBackFromChat = useCallback(() => {
    setIsInChat(false);
  }, []);

  if (loginStatus === 'loading') {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <p>登录中...</p>
      </div>
    );
  }

  if (loginStatus === 'error') {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <p style={{ color: '#ff4757' }}>登录失败，请检查账号密码</p>
        <button
          type="button"
          onClick={onLogout}
          className="login-button"
          style={{ width: 200, marginTop: 20 }}
        >
          重新登录
        </button>
      </div>
    );
  }

  // 聊天页面全屏覆盖，不显示 TabBar
  if (isInChat) {
    return (
      <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
        <ChatContent onBack={handleBackFromChat} />
      </div>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'conversation' && (
          <ConversationContent onEnterChat={handleEnterChat} />
        )}
        {activeTab === 'contact' && <ContactContent onEnterChat={handleEnterChat} />}
        {activeTab === 'me' && <MeContent userId={userId} onLogout={onLogout} />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const FullUikitDemo: React.FC = () => {
  const [showAppKeyModal, setShowAppKeyModal] = useState(false);
  const { setAppKey } = useAppStore();

  const [loginInfo, setLoginInfo] = useState<{
    appKey: string;
    userId: string;
    password: string;
  } | null>(null);

  const isLoggedIn = !!loginInfo;

  const handleLogin = (ak: string, uid: string, pwd: string) => {
    setAppKey(ak);
    setLoginInfo({ appKey: ak, userId: uid, password: pwd });
  };

  const handleLogout = () => {
    setLoginInfo(null);
  };

  if (isLoggedIn && loginInfo) {
    return (
      <div className="h5-container">
        <header
          className="h5-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h1 style={{ flex: 1, textAlign: 'center' }}>完整 UIKIT 演示</h1>
        </header>
        <UIKitProvider
          theme={{ mode: 'light' }}
          initConfig={{
            appKey: loginInfo.appKey,
          }}
          local={{ lng: 'zh' }}
        >
          <UikitMain
            userId={loginInfo.userId}
            password={loginInfo.password}
            onLogout={handleLogout}
          />
        </UIKitProvider>
        <footer className="h5-footer">
          <Link to="/">返回首页</Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="h5-container">
      <header className="h5-header">
        <h1>完整 UIKIT 演示</h1>
      </header>
      <main className="h5-main" style={{ padding: 0 }}>
        <LoginForm onLogin={handleLogin} />
      </main>
      <footer className="h5-footer">
        <Link to="/">返回首页</Link>
      </footer>

      <AppKeyModal
        isOpen={showAppKeyModal}
        onClose={() => setShowAppKeyModal(false)}
        onConfirm={() => setShowAppKeyModal(false)}
      />
    </div>
  );
};

export default FullUikitDemo;
