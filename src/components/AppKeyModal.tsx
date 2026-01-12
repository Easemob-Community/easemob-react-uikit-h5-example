import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

interface AppKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AppKeyModal: React.FC<AppKeyModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { appKey, setAppKey } = useAppStore();
  const [inputValue, setInputValue] = useState(appKey || '');
  const [error, setError] = useState('');

  // 监听 appKey 变化，确保弹窗打开时能回显最新值
  useEffect(() => {
    if (isOpen) {
      setInputValue(appKey || '');
    }
  }, [isOpen, appKey]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setError('请输入AppKey');
      return;
    }
    
    // 这里可以添加AppKey格式验证
    setAppKey(inputValue.trim());
    onConfirm();
    setError('');
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>请输入AppKey</h3>
        <p className="modal-description">请从环信开发者后台获取您的AppKey并输入</p>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="请输入AppKey"
          className={`modal-input ${error ? 'error' : ''}`}
          autoFocus
        />
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="modal-buttons">
          <button className="btn-secondary" onClick={handleClose}>
            取消
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppKeyModal;