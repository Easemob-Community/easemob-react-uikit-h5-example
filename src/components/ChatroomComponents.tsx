import React, { useState, useEffect, memo } from 'react';
import { UIKitProvider, Chatroom, ChatroomMember, useClient } from "easemob-chat-uikit";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import type { ChatSDK } from 'easemob-chat-uikit/types/module/SDK';

// 统一的聊天室入口组件，包含所有聊天室相关功能
const ChatroomEntryPoint: React.FC = () => {
    const { appKey } = useAppStore();
    const location = useLocation();

    // 根据当前路径渲染不同内容
    const renderContent = () => {
        const currentPath = location.pathname;

        if (currentPath === '/chatroom-uikit/chatroom') {
            return <ChatroomPageContent />;
        } else if (currentPath === '/chatroom-uikit/members') {
            return <ChatroomMemberPageContent />;
        }

        // 默认返回空或错误处理
        return null;
    };

    return (
        <UIKitProvider
            theme={{
                mode: "light",
            }}
            initConfig={{
                appKey: appKey || "",
            }}
            local={{
                lng: "zh",
            }}
        >
            {renderContent()}
        </UIKitProvider>
    );
};

// 聊天室页面内容组件
const ChatroomPageContent: React.FC = () => {
    const navigate = useNavigate();
    const { userId, token, chatroomId: storeChatroomId } = useAppStore();
    const client = useClient();

    // 从全局状态获取chatroomId
    const [currentChatroomId, setCurrentChatroomId] = useState<string>(storeChatroomId);

    // 监听全局状态变化
    useEffect(() => {
        if (storeChatroomId !== currentChatroomId) {
            setCurrentChatroomId(storeChatroomId);
        }
    }, [storeChatroomId, currentChatroomId]);

    // 组件挂载时执行登录
    useEffect(() => {
        if (userId && token) {
            client
                .open({
                    user: userId,
                    accessToken: token,
                })
                .then((res: any) => {
                    console.log("登录成功", res);
                })
                .catch((err: any) => {
                    console.error("登录失败", err);
                });
        }
    }, [client, userId, token]);

    // 设置事件处理器
    useEffect(() => {
        if (client.addEventHandler) {
            client.addEventHandler("chatroom", {
                onConnected: () => {
                    console.log("已建立连接");
                },
                onDisconnected: () => {
                    console.log("连接已断开");
                }
            });
        }

        // 清理事件处理器
        return () => {
            if (client.removeEventHandler) {
                client.removeEventHandler("chatroom");
            }
        };
    }, [client]);

    return (
        <div className="chatroom-page-container">
            <div className="top-navigation">
                <button
                    onClick={() => navigate('/chatroom-uikit')}
                    className={'back-button'}
                >
                    ← 返回
                </button>
                <div className="nav-tabs">
                    <button
                        onClick={() => navigate('/chatroom-uikit/chatroom')}
                        className={'nav-button active'}
                    >
                        聊天室
                    </button>
                    <button
                        onClick={() => navigate('/chatroom-uikit/members')}
                        className={'nav-button'}
                    >
                        成员
                    </button>
                </div>
            </div>
            <div className="chatroom-full-section">
                <Chatroom chatroomId={currentChatroomId} showUnreadCount={true} customMessageRenderers={{
                    custom: ctx => {
                        const message = ctx.message as ChatSDK.CustomMsgBody;
                        // 隐藏加入消息
                        if (message.customEvent === 'CHATROOMUIKITUSERJOIN') {
                            return null;
                        }
                        // 其他 custom 消息（如礼物）使用默认渲染
                        // return <ChatroomMessage message={message} key={message.id} />;
                    },
                }}></Chatroom>
            </div>
        </div>
    );
};

// 聊天室成员页面内容组件
const ChatroomMemberPageContent: React.FC = () => {
    const navigate = useNavigate();
    const { userId, token, chatroomId: storeChatroomId } = useAppStore();
    const client = useClient();

    // 从全局状态获取chatroomId
    const [currentChatroomId, setCurrentChatroomId] = useState<string>(storeChatroomId);

    // 监听全局状态变化
    useEffect(() => {
        if (storeChatroomId !== currentChatroomId) {
            setCurrentChatroomId(storeChatroomId);
        }
    }, [storeChatroomId, currentChatroomId]);

    // 组件挂载时执行登录
    useEffect(() => {
        if (userId && token) {
            client
                .open({
                    user: userId,
                    accessToken: token,
                })
                .then((res: any) => {
                    console.log("登录成功", res);
                })
                .catch((err: any) => {
                    console.error("登录失败", err);
                });
        }
    }, [client, userId, token]);

    // 设置事件处理器
    useEffect(() => {
        if (client.addEventHandler) {
            client.addEventHandler("chatroom", {
                onConnected: () => {
                    console.log("已建立连接");
                },
                onDisconnected: () => {
                    console.log("连接已断开");
                }
            });
        }

        // 清理事件处理器
        return () => {
            if (client.removeEventHandler) {
                client.removeEventHandler("chatroom");
            }
        };
    }, [client]);

    return (
        <div className="chatroom-page-container">
            <div className="top-navigation">
                <button
                    onClick={() => navigate('/chatroom-uikit')}
                    className={'back-button'}
                >
                    ← 返回
                </button>
                <div className="nav-tabs">
                    <button
                        onClick={() => navigate('/chatroom-uikit/chatroom')}
                        className={'nav-button'}
                    >
                        聊天室
                    </button>
                    <button
                        onClick={() => navigate('/chatroom-uikit/members')}
                        className={'nav-button active'}
                    >
                        成员
                    </button>
                </div>
            </div>
            <div className="chatroom-full-section">
                <ChatroomMember chatroomId={currentChatroomId}></ChatroomMember>
            </div>
        </div>
    );
};

export { ChatroomEntryPoint, ChatroomPageContent, ChatroomMemberPageContent };

export default ChatroomEntryPoint;