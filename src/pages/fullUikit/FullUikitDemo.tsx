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
  savedAppKey: string | null;
  onLogin: (appKey: string, userId: string, password: string) => void;
  onOpenAppKeyModal: () => void;
}> = ({ savedAppKey, onLogin, onOpenAppKeyModal }) => {
  const [appKeyInput, setAppKeyInput] = useState(savedAppKey || '');
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appKeyInput.trim()) {
      setError('请输入 AppKey');
      return;
    }
    if (!userIdInput.trim()) {
      setError('请输入用户 ID');
      return;
    }
    if (!passwordInput.trim()) {
      setError('请输入密码');
      return;
    }
    setError('');
    onLogin(appKeyInput.trim(), userIdInput.trim(), passwordInput.trim());
  };

  const isFilled = (v: string) => v.length > 0;

  return (
    <div className="login-form-container">
      <div className="login-form-header">
        <div className="login-form-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="login-form-title">单群聊 UIKIT</h2>
        <p className="login-form-subtitle">请输入您的账号信息以继续</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="login-form-error">{error}</div>}

        <div className={`form-row ${focusedField === 'appKey' ? 'focused' : ''} ${isFilled(appKeyInput) ? 'filled' : ''}`}>
          <label className="form-row-label">AppKey</label>
          <div className="form-row-input-wrap">
            <input
              type="text"
              value={appKeyInput}
              onChange={(e) => {
                setAppKeyInput(e.target.value);
                if (error) setError('');
              }}
              onFocus={() => setFocusedField('appKey')}
              onBlur={() => setFocusedField(null)}
              placeholder="请输入 AppKey"
              className="form-row-input"
              autoComplete="off"
            />
            <button
              type="button"
              className="form-row-suffix-btn"
              onClick={onOpenAppKeyModal}
              title="配置 AppKey"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`form-row ${focusedField === 'userId' ? 'focused' : ''} ${isFilled(userIdInput) ? 'filled' : ''}`}>
          <label className="form-row-label">用户 ID</label>
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => {
              setUserIdInput(e.target.value);
              if (error) setError('');
            }}
            onFocus={() => setFocusedField('userId')}
            onBlur={() => setFocusedField(null)}
            placeholder="请输入用户ID"
            className="form-row-input"
            autoComplete="username"
          />
        </div>

        <div className={`form-row ${focusedField === 'password' ? 'focused' : ''} ${isFilled(passwordInput) ? 'filled' : ''}`}>
          <label className="form-row-label">密码</label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              if (error) setError('');
            }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="请输入密码"
            className="form-row-input"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="login-submit-btn">
          <span>登 录</span>
        </button>
      </form>
    </div>
  );
};

// 聊天页面内容
const ChatContent: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Chat
        headerProps={{
          back: true,
          onClickBack: onBack,
        }}
      />
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

// TabBar 图标
const TabMessageIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const TabContactIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TabMeIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// TabBar 组件
const TabBar: React.FC<{
  activeTab: 'conversation' | 'contact' | 'me';
  onTabChange: (tab: 'conversation' | 'contact' | 'me') => void;
  unreadCount?: number;
}> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  const tabs: {
    key: 'conversation' | 'contact' | 'me';
    label: string;
    Icon: React.FC<{ active: boolean }>;
  }[] = [
    { key: 'conversation', label: '会话', Icon: TabMessageIcon },
    { key: 'contact', label: '联系人', Icon: TabContactIcon },
    { key: 'me', label: '我的', Icon: TabMeIcon },
  ];

  const activeIndex = tabs.findIndex((t) => t.key === activeTab);

  return (
    <div className="tabbar">
      <div
        className="tabbar-indicator"
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`tabbar-item ${isActive ? 'active' : ''}`}
          >
            <div className="tabbar-icon-wrap">
              <tab.Icon active={isActive} />
              {tab.key === 'conversation' && unreadCount > 0 && (
                <span className="tabbar-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="tabbar-label">{tab.label}</span>
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
  const { appKey, setAppKey } = useAppStore();

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

  const handleAppKeyConfirm = (value: string) => {
    setAppKey(value);
    setShowAppKeyModal(false);
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
        <LoginForm
          savedAppKey={appKey}
          onLogin={handleLogin}
          onOpenAppKeyModal={() => setShowAppKeyModal(true)}
        />
      </main>
      <footer className="h5-footer">
        <Link to="/">返回首页</Link>
      </footer>

      <AppKeyModal
        isOpen={showAppKeyModal}
        onClose={() => setShowAppKeyModal(false)}
        onConfirm={handleAppKeyConfirm}
      />
    </div>
  );
};

export default FullUikitDemo;
