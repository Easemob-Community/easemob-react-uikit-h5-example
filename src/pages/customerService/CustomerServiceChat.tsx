/**
 * ============================================================================
 * 客服聊天页面 - CustomerServiceChat.tsx
 * ============================================================================
 *
 * 【职责】初始化环信 UIKit，执行 IM 登录，并设置当前会话为客服群组。
 *
 * 【数据来源】当前从 appStore 读取 csAppKey / csUserId / csPassword / csGroupId。
 *   - 手动配置模式下：这些数据来自用户弹窗输入，持久化在 localStorage
 *   - 接口化改造后：这些数据来自 GET /api/customer-service/config 和
 *     POST /api/customer-service/session 的响应，同样通过 appStore 流转
 *
 * 【接口化改造要点】
 *   1. 若后端返回 imToken（推荐），将 client.open({ user, pwd }) 改为
 *      client.open({ user, accessToken: token })，安全性更高
 *   2. groupName 当前写死为 "云管家客服"；接口化后可从 /session 接口的
 *      groupName 字段动态获取，提升体验
 * ============================================================================
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UIKitProvider,
  Chat,
  useClient,
  useConversationContext,
  useAddressContext,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setAppUserInfo } = useAddressContext();
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
        /*
         * 【接口化改造】若后端返回 token（推荐，更安全），使用以下方式登录：
         *
         * accessToken: token,  // 将 pwd 替换为 accessToken
         *
         * 注意：token 和 password 二选一即可，优先使用 token。
         * 若使用 token，需确保 CustomerServiceScenario.tsx 中的 setCsConfig
         * 将 token 存入 password 字段（或新增 token 字段并同步修改此处传参）。
         */
      })
      .then(() => {
        console.log('客服场景登录成功');
        setLoginStatus('success');

        // 【示例】设置当前登录用户的昵称和头像（取消注释即可使用）
        setAppUserInfo({
          [userId]: {
            userId: userId,
            nickname: '客服用户昵称',
            avatarurl: 'https://example.com/avatar.png',
          },
        });
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
  // 【数据来源说明】csAppKey / csUserId / csPassword / csGroupId 来自 appStore
  // 手动配置模式：用户弹窗输入 -> setCsConfig -> localStorage 持久化
  // 接口化改造后：GET /api/customer-service/config -> setCsConfig -> 此处读取
  //               POST /api/customer-service/session -> 返回 groupId -> setCsConfig -> 此处读取
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
          /*
           * 【接口化改造】groupName 当前写死，可从 /session 接口动态获取：
           * 1. 在 appStore 中新增 csGroupName 字段
           * 2. CustomerServiceScenario.tsx 中收到 /session 响应后存入
           * 3. 此处改为 groupName={csGroupName}
           */
          groupName="云管家客服"
          onBack={handleBack}
        />
      </UIKitProvider>
    </div>
  );
};

export default CustomerServiceChat;
