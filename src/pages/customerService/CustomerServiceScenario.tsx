/**
 * ============================================================================
 * 客服场景主页面 - CustomerServiceScenario.tsx
 * ============================================================================
 *
 * 【当前模式】手动配置模式（演示/开发调试使用）
 *   用户需在弹窗中手动输入 AppKey、userId、password、groupId 四项信息，
 *   数据通过 zustand + localStorage 持久化。
 *
 * 【接口化改造目标】接入后端接口，实现免登录 + 自动建群
 *   1. 进入页面时自动调用 GET /api/customer-service/config 获取 IM 配置
 *      （appKey、imUserId、imToken/imPassword）
 *   2. 点击服务卡片时自动调用 POST /api/customer-service/session 创建/复用群组
 *      （返回 groupId、groupName）
 *   3. 保留手动配置弹窗作为接口失败时的降级方案
 *
 * 【改造步骤】
 *   1. 后端按 SERVER_API_SPEC.md 实现两个接口
 *   2. 在本文件中搜索 "【接口化改造】" 注释，取消对应代码块的注释
 *   3. 将 yourJwtToken 替换为实际的用户鉴权 token 获取逻辑
 *   4. 如需 token 登录方式，同步修改 CustomerServiceChat.tsx 中的 client.open()
 *
 * 【服务类型映射】（供后端接口 serviceType 字段使用）
 *   跑腿代办 -> errand     就医挂号 -> medical    儿童服务 -> child
 *   老人便民 -> elderly    宠物服务 -> pet        文旅出行 -> travel
 *   运动娱乐 -> sports     万能代办 -> universal
 * ============================================================================
 */
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

// 服务列表数据。id 字段当前仅作前端渲染 key 使用；
// 接口化改造后，建议将 id 改为对应 serviceType（如 'errand'），
// 以便直接透传给 POST /api/customer-service/session 接口。
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

/**
 * 客服场景主页面组件
 *
 * 登录配置流程：
 * 1. 页面加载时从 appStore（zustand + localStorage 持久化）读取客服配置信息
 * 2. 若 csAppKey / csUserId / csPassword / csGroupId 任一字段为空，则视为未配置
 * 3. 用户点击服务卡片时，若未配置则弹出配置面板；已配置则模拟加载并跳转至客服会话页
 * 4. 配置面板收集的四项信息通过 setCsConfig 写入 store 并自动持久化到 localStorage
 */
const CustomerServiceScenario: React.FC = () => {
  const navigate = useNavigate();
  // 从全局状态管理获取客服相关配置及更新方法（数据持久化在 localStorage）
  const { csAppKey, csUserId, csPassword, csGroupId, setCsConfig } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('客服正在接入请稍等');
  // 控制客服账号配置弹窗的显隐
  const [showConfigModal, setShowConfigModal] = useState(false);

  // 校验四项客服必填配置是否均已填写，决定是否可以进入会话
  const isConfigured = !!(csAppKey && csUserId && csPassword && csGroupId);

  /*
   * 【接口化改造 - 步骤1】进入页面时自动获取 IM 配置（免登录）
   *
   * 取消下方代码块注释，即可在页面加载时自动请求后端接口获取配置。
   * 获取成功后写入 store 并持久化，用户无需手动填写弹窗。
   * 若接口失败（如网络异常、未登录），保持未配置状态，由弹窗降级处理。
   *
   * 注意：需将 yourJwtToken 替换为实际获取用户鉴权 token 的逻辑。
   *
   * useEffect(() => {
   *   const fetchConfig = async () => {
   *     try {
   *       const res = await fetch('/api/customer-service/config', {
   *         headers: { Authorization: `Bearer ${yourJwtToken}` }
   *       });
   *       const result = await res.json();
   *       if (result.code === 200 && result.data) {
   *         const { appKey, imUserId, imToken, imPassword } = result.data;
   *         // 优先使用 token，其次使用 password；groupId 暂空，由点击卡片时获取
   *         setCsConfig(appKey, imUserId, imToken || imPassword || '', '');
   *       }
   *     } catch (err) {
   *       console.error('【接口化改造】获取客服配置失败', err);
   *       // 接口失败时不阻断，保持未配置状态，由用户手动填写或弹窗提示
   *     }
   *   };
   *   // 仅在未配置时请求，避免覆盖用户已手动填写的配置
   *   if (!isConfigured) fetchConfig();
   * }, []);
   */

  /**
   * 点击服务卡片时的处理逻辑
   * - 若客服账号未配置（isConfigured === false），弹出配置面板阻止进入
   * - 若已配置，展示加载动画，3 秒后导航至客服聊天页面
   *
   * 【接口化改造 - 步骤2】点击卡片时自动创建/复用客服群组
   *
   * 取消下方代码块注释，替换现有 setTimeout 逻辑，即可在点击卡片时：
   * 1. 调用后端接口 POST /api/customer-service/session
   * 2. 将返回的 groupId 存入 store
   * 3. 立即导航至客服聊天页（无需等待 3 秒）
   *
   * 注意：
   * - 需将 yourJwtToken 替换为实际的用户鉴权 token
   * - 若 serviceItems 的 id 已改为 serviceType（如 'errand'），直接透传 item.id 即可
   * - 接口失败时可降级为弹窗提示或保持现有加载动画后跳转
   */
  const handleServiceClick = (item: ServiceItem) => {
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    /*
     * 【接口化改造】自动建群示例代码（取消注释后使用）
     *
     * setLoading(true);
     * setLoadingText('正在为您分配客服，请稍等...');
     * const createSession = async () => {
     *   try {
     *     const res = await fetch('/api/customer-service/session', {
     *       method: 'POST',
     *       headers: {
     *         'Content-Type': 'application/json',
     *         Authorization: `Bearer ${yourJwtToken}`
     *       },
     *       body: JSON.stringify({
     *         serviceType: item.id,   // 建议改为 serviceType 如 'errand'
     *         serviceName: item.title,
     *         bizParams: { sourcePage: 'customer-service' }
     *       })
     *     });
     *     const result = await res.json();
     *     if (result.code === 200 && result.data) {
     *       const { groupId, groupName } = result.data;
     *       // 将 groupId 追加到现有配置中，保留 appKey / userId / password
     *       setCsConfig(csAppKey, csUserId, csPassword, groupId);
     *       // 可将 groupName 存入另一状态或 localStorage，供聊天页标题展示
     *       navigate('/customer-service/chat');
     *     } else {
     *       setLoadingText(`客服接入失败：${result.message || '请稍后重试'}`);
     *       setTimeout(() => setLoading(false), 2000);
     *     }
     *   } catch (err) {
     *     console.error('【接口化改造】创建客服会话失败', err);
     *     setLoadingText('网络异常，请检查网络后重试');
     *     setTimeout(() => setLoading(false), 2000);
     *   }
     * };
     * createSession();
     */

    // 【当前模式】模拟加载 3 秒后跳转（接口化后请删除或注释掉以下代码）
    setLoading(true);
    setLoadingText(`客服正在接入，请稍等...\n您选择了：${item.title}`);
    setTimeout(() => {
      navigate('/customer-service/chat');
    }, 3000);
  };

  /**
   * 配置面板确认回调
   * 将用户输入的 AppKey、用户ID、密码、群组ID 通过 setCsConfig 保存至全局状态
   * 并自动持久化到 localStorage，供后续页面（如客服聊天页）读取使用
   */
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

/**
 * 客服账号配置弹窗组件
 *
 * 职责：
 * 1. 收集环信客服场景所需的四项核心认证信息：AppKey、用户ID、密码、客服群组ID
 * 2. 对表单进行非空校验，确保必填项均已填写
 * 3. 通过 onConfirm 回调将合法数据回传至父组件，最终写入全局状态并持久化
 *
 * @param isOpen       弹窗显隐开关
 * @param onClose      关闭弹窗回调
 * @param onConfirm    确认配置回调，接收四项字符串参数
 * @param isConfigured 标识当前是否已完成过配置，用于展示首次使用的提示文案
 */
const CustomerServiceConfigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appKey: string, userId: string, password: string, groupId: string) => void;
  isConfigured?: boolean;
}> = ({ isOpen, onClose, onConfirm, isConfigured }) => {
  // 表单状态：分别对应四项客服配置字段
  const [appKey, setAppKey] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [groupId, setGroupId] = useState('');
  // 表单校验错误提示信息
  const [error, setError] = useState('');

  if (!isOpen) return null;

  /**
   * 确认按钮点击处理
   * 对四项输入进行非空校验，任一为空则阻断并提示对应错误信息
   * 全部合法后清除错误状态，将去除首尾空白的值通过 onConfirm 回传
   */
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
