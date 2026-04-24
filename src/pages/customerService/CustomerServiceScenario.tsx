import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerService.css';
import { useAppStore } from '../../store/appStore';

interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const serviceItems: ServiceItem[] = [
  { id: '1', icon: '🏃', title: '跑腿代办', desc: '代缴费、代查询、代收发、代排队、代提醒' },
  { id: '2', icon: '🏥', title: '就医挂号', desc: '代约号、代抢专家号、体检疫苗、医保备案' },
  { id: '3', icon: '👶', title: '儿童服务', desc: '入学登记、兴趣班报名、填表打卡、儿保疫苗' },
  { id: '4', icon: '👴', title: '老人便民', desc: '社保医保查询、补贴申请、证件办理、挂号' },
  { id: '5', icon: '🐶', title: '宠物服务', desc: '医院预约、犬证办理、活动报名、托运材料' },
  { id: '6', icon: '🏕️', title: '文旅出行', desc: '代抢车票、代订酒店景区、演出展会代抢' },
  { id: '7', icon: '⚽', title: '运动娱乐', desc: '赛事报名、场地预约、演唱会门票代抢' },
  { id: '8', icon: '📋', title: '万能代办', desc: '代填表、代申请、资料整理、线上操作' },
];

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const SettingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CustomerServiceScenario: React.FC = () => {
  const navigate = useNavigate();
  const { csAppKey, csUserId, csPassword, csGroupId, setCsConfig } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('客服正在接入请稍等');
  const [showConfigModal, setShowConfigModal] = useState(false);

  const isConfigured = !!(csAppKey && csUserId && csPassword && csGroupId);

  const handleServiceClick = (item: ServiceItem) => {
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }
    setLoading(true);
    setLoadingText(`客服正在接入，请稍等...\n您选择了：${item.title}`);
    setTimeout(() => {
      navigate('/customer-service/chat');
    }, 3000);
  };

  const handleConfigConfirm = (appKey: string, userId: string, password: string, groupId: string) => {
    setCsConfig(appKey, userId, password, groupId);
    setShowConfigModal(false);
  };

  return (
    <div className="h5-container cs-scenario-page">
      <div className="cs-nav-bar">
        <button className="cs-nav-back" onClick={() => navigate('/')}>
          <BackIcon />
        </button>
        <span className="cs-nav-title">云管家</span>
        <div className="cs-nav-right">
          <button className="cs-nav-icon-btn" onClick={() => setShowConfigModal(true)} title="配置客服账号">
            <SettingIcon />
          </button>
        </div>
      </div>

      <div className="cs-scenario-body">
        <div className="cs-vip-card">
          <div className="cs-vip-left">
            <div className="cs-vip-title">解锁SVIP</div>
            <div className="cs-vip-tags">
              <span className="cs-vip-tag blue">优选服务</span>
              <span className="cs-vip-tag purple">AI智能助理</span>
              <span className="cs-vip-tag orange">专属权益</span>
            </div>
          </div>
          <div className="cs-vip-right">
            <div className="cs-vip-price">包年 ¥1800起</div>
            <button className="cs-vip-btn">去解锁</button>
          </div>
        </div>

        <div className="cs-greeting">
          <div className="cs-greeting-title">您好👋</div>
          <div className="cs-greeting-text">
            我是线上云管家，代抢票、代预约、代报名、代填表、代办跑腿都可以做，请问您需要办理什么业务？
          </div>
        </div>

        <div className="cs-section-title">大家都在问</div>
        <div className="cs-service-grid">
          {serviceItems.map((item) => (
            <div key={item.id} className="cs-service-card" onClick={() => handleServiceClick(item)}>
              <div className="cs-service-card-header">
                <span className="cs-service-icon">{item.icon}</span>
                <span className="cs-service-title">{item.title}</span>
              </div>
              <div className="cs-service-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cs-bottom-input">
        <div className="cs-input-bar">
          <input type="text" placeholder="发消息或者按住说话..." className="cs-input-field" readOnly />
          <button className="cs-input-voice">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
      </div>

      {loading && (
        <div className="cs-loading-overlay">
          <div className="cs-loading-box">
            <div className="cs-loading-spinner">
              <div className="cs-spinner-ring"></div>
              <div className="cs-spinner-ring"></div>
              <div className="cs-spinner-ring"></div>
            </div>
            <div className="cs-loading-text">
              {loadingText.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <CustomerServiceConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfirm={handleConfigConfirm}
        isConfigured={isConfigured}
      />
    </div>
  );
};

const CustomerServiceConfigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appKey: string, userId: string, password: string, groupId: string) => void;
  isConfigured?: boolean;
}> = ({ isOpen, onClose, onConfirm, isConfigured }) => {
  const [appKey, setAppKey] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!appKey.trim()) { setError('请输入 AppKey'); return; }
    if (!userId.trim()) { setError('请输入用户 ID'); return; }
    if (!password.trim()) { setError('请输入密码'); return; }
    if (!groupId.trim()) { setError('请输入群组 ID'); return; }
    setError('');
    onConfirm(appKey.trim(), userId.trim(), password.trim(), groupId.trim());
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-container" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <div className="sheet-drag-bar" />
          <div className="sheet-title-row">
            <span className="sheet-title">配置客服账号</span>
            <button className="sheet-close-btn" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="sheet-body">
          {!isConfigured && (
            <div className="sheet-desc" style={{ color: '#ff7e5f', fontWeight: 500 }}>
              首次使用请先配置客服账号信息，配置完成后即可点击问题进入对话。
            </div>
          )}
          {error && <div className="login-form-error">{error}</div>}
          <div className="form-field">
            <label className="form-label">AppKey</label>
            <input className="form-input" type="text" value={appKey} onChange={(e) => { setAppKey(e.target.value); if (error) setError(''); }} placeholder="请输入 AppKey" />
          </div>
          <div className="form-field">
            <label className="form-label">用户 ID</label>
            <input className="form-input" type="text" value={userId} onChange={(e) => { setUserId(e.target.value); if (error) setError(''); }} placeholder="请输入用户ID" />
          </div>
          <div className="form-field">
            <label className="form-label">密码</label>
            <input className="form-input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }} placeholder="请输入密码" />
          </div>
          <div className="form-field">
            <label className="form-label">群组 ID（客服群）</label>
            <input className="form-input" type="text" value={groupId} onChange={(e) => { setGroupId(e.target.value); if (error) setError(''); }} placeholder="请输入客服群组ID" />
          </div>
        </div>
        <div className="sheet-footer">
          <button className="sheet-btn sheet-btn-primary" onClick={handleConfirm}>确认配置</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceScenario;
