import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';

interface AppKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

const AppKeyModal: React.FC<AppKeyModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { appKey } = useAppStore();
  const [inputValue, setInputValue] = useState(appKey || '');
  const [error, setError] = useState('');
  const [exiting, setExiting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen && !exiting) return null;

  const handleClose = () => {
    setError('');
    setExiting(true);
  };

  const handleAnimationEnd = () => {
    if (exiting) {
      setExiting(false);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('请输入 AppKey');
      return;
    }
    if (trimmed.length < 5) {
      setError('AppKey 格式不正确');
      return;
    }
    setError('');
    setExiting(true);
    setTimeout(() => onConfirm(trimmed), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div
      className={`sheet-overlay ${exiting ? 'sheet-exit' : ''}`}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`sheet-container ${exiting ? 'sheet-exit' : ''}`}
        role="dialog"
        aria-modal="true"
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="sheet-header">
          <div className="sheet-drag-bar" />
          <div className="sheet-title-row">
            <span className="sheet-title">配置 AppKey</span>
            <button type="button" className="sheet-close-btn" onClick={handleClose} aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="sheet-body">
          <p className="sheet-desc">
            从
            <a
              href="https://console.easemob.com"
              target="_blank"
              rel="noopener noreferrer"
              className="sheet-link"
            >
              环信开发者后台
            </a>
            获取您的 AppKey
          </p>

          <div className={`form-field ${error ? 'has-error' : ''}`}>
            <label className="form-label">AppKey</label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="例如：xxxx#xxxx"
              className="form-input"
              autoComplete="off"
              autoFocus
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        </div>

        <div className="sheet-footer">
          <button type="button" className="sheet-btn sheet-btn-primary" onClick={handleSubmit}>
            保存并使用
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppKeyModal;