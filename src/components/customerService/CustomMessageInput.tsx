/**
 * ============================================================================
 * 客服场景自定义输入框 - CustomMessageInput.tsx
 * ============================================================================
 *
 * 【职责】实现微信风格的"语音优先"交互（点击录音版）：
 *   1. 默认状态：底部显示 [键盘] [点击说话] [表情] [+]
 *   2. 点击"点击说话"：开始录音，按钮变为"点击结束"
 *   3. 点击"点击结束"：停止录音并发送
 *   4. 点击键盘图标：切换到文本模式 [语音] [输入框] [表情] [+]
 *
 * 【技术方案】
 *   - 文本模式：使用 UIKit MessageInput（TEXTAREA + EMOJI + MORE）
 *   - 语音模式：自己实现录音逻辑（基于 Web Audio API），完全控制交互
 * ============================================================================
 */
import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { MessageInput, useSDK, RootContext } from 'easemob-chat-uikit';
import type { MessageInputProps } from 'easemob-chat-uikit';
import './CustomMessageInput.css';

/* ------------------------------------------------------------------ */
/*  录音工具类（参考 UIKit 内部 HZRecorder 实现）                       */
/* ------------------------------------------------------------------ */

interface HZRecorderInstance {
  start: () => void;
  stop: () => void;
  getBlob: () => Blob;
}

const createHZRecorder = (
  stream: MediaStream
): HZRecorderInstance => {
  const audioContext = new AudioContext();
  const mediaSource = audioContext.createMediaStreamSource(stream);
  const scriptProcessor = audioContext.createScriptProcessor(16 * 1024, 1, 1);

  const config = {
    sampleBits: 16,
    sampleRate: 16000,
  };

  const buffer: Float32Array[] = [];
  let size = 0;

  const inputSampleRate = audioContext.sampleRate;
  const outputSampleRate = config.sampleRate;

  const compress = (): Float32Array => {
    const data = new Float32Array(size);
    let offset = 0;
    for (const chunk of buffer) {
      data.set(chunk, offset);
      offset += chunk.length;
    }

    // 降采样
    const ratio = inputSampleRate / outputSampleRate;
    const length = Math.round(data.length / ratio);
    const result = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(i * ratio);
      result[i] = data[Math.min(idx, data.length - 1)];
    }
    return result;
  };

  const encodeWAV = (): Blob => {
    const sampleRate = Math.min(inputSampleRate, outputSampleRate);
    const sampleBits = 16;
    const data = compress();
    const dataLength = data.length * (sampleBits / 8);
    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrayBuffer);

    const writeString = (str: string, offset: number) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    let offset = 0;
    writeString('RIFF', offset); offset += 4;
    view.setUint32(offset, 36 + dataLength, true); offset += 4;
    writeString('WAVE', offset); offset += 4;
    writeString('fmt ', offset); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * (sampleBits / 8), true); offset += 4;
    view.setUint16(offset, sampleBits / 8, true); offset += 2;
    view.setUint16(offset, sampleBits, true); offset += 2;
    writeString('data', offset); offset += 4;
    view.setUint32(offset, dataLength, true); offset += 4;

    for (let i = 0; i < data.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  scriptProcessor.onaudioprocess = (e) => {
    buffer.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    size += e.inputBuffer.getChannelData(0).length;
  };

  return {
    start: () => {
      mediaSource.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
    },
    stop: () => {
      if (audioContext.state === 'running') {
        audioContext.close();
      }
      scriptProcessor.disconnect();
      mediaSource.disconnect();
    },
    getBlob: () => {
      return encodeWAV();
    },
  };
};

/* ------------------------------------------------------------------ */
/*  主组件                                                             */
/* ------------------------------------------------------------------ */

const CustomMessageInput: React.FC<MessageInputProps> = (props) => {
  const [isTextMode, setIsTextMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const { rootStore } = useContext(RootContext);
  const { ChatSDK } = useSDK();

  const recorderRef = useRef<HZRecorderInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  // 清理资源
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    durationRef.current = 0;
    setRecordDuration(0);
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = createHZRecorder(stream);
      recorderRef.current = recorder;
      recorder.start();

      setIsRecording(true);
      durationRef.current = 0;
      setRecordDuration(0);

      // 计时器
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setRecordDuration(durationRef.current);
      }, 1000);
    } catch (err) {
      console.error('录音启动失败', err);
      alert('无法启动录音，请检查麦克风权限');
    }
  }, []);

  // 停止录音并发送
  const stopRecording = useCallback(() => {
    if (!recorderRef.current || !streamRef.current) return;

    const duration = durationRef.current;
    if (duration < 1) {
      cleanup();
      alert('录音时间太短');
      return;
    }

    const blob = recorderRef.current.getBlob();
    cleanup();

    // 构建音频消息
    const fileData = {
      url: window.URL.createObjectURL(blob),
      filename: 'audio-message.wav',
      filetype: 'audio',
      data: blob,
      length: duration,
      duration: duration,
    };

    // 获取当前会话信息（优先用 props，其次用 rootStore 中的当前会话）
    const currentCvs = props.conversation || rootStore.conversationStore.currentCvs;
    if (!currentCvs?.conversationId) {
      console.error('发送语音消息失败：没有当前会话');
      return;
    }

    const message = ChatSDK.message.create({
      type: 'audio',
      to: currentCvs.conversationId,
      chatType: currentCvs.chatType,
      file: fileData,
      filename: '',
      length: duration,
      isChatThread: false,
    });

    // 使用 UIKit messageStore.sendMessage 发送，复用其内部逻辑（状态更新、错误处理等）
    rootStore.messageStore.sendMessage(message).catch((err: unknown) => {
      console.error('发送语音消息失败', err);
    });
  }, [ChatSDK, rootStore, props.conversation, cleanup]);

  // 切换录音状态
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const switchToTextMode = useCallback(() => {
    if (isRecording) cleanup();
    setIsTextMode(true);
  }, [isRecording, cleanup]);

  const switchToVoiceMode = useCallback(() => {
    setIsTextMode(false);
  }, []);

  return (
    <div className="cs-custom-input-wrapper">
      {!isTextMode ? (
        /* 语音模式 */
        <div className="cs-voice-mode">
          <button
            type="button"
            className="cs-mode-switch-btn"
            onClick={switchToTextMode}
            title="键盘输入"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="13" rx="2" />
              <path d="M6 21H18" />
              <path d="M9 21L8 24" />
              <path d="M15 21L16 24" />
            </svg>
          </button>

          {/* 自定义录音按钮 */}
          <button
            type="button"
            className={`cs-record-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            {isRecording ? (
              <span className="cs-record-text">
                <span className="cs-record-dot" />
                点击结束 {recordDuration > 0 ? `${recordDuration}"` : ''}
              </span>
            ) : (
              <span className="cs-record-text">点击说话</span>
            )}
          </button>

          {/* 表情和更多使用 UIKit */}
          <div className="cs-voice-actions-wrapper">
            <MessageInput
              {...props}
              actions={[
                { name: 'RECORDER', visible: false },
                { name: 'TEXTAREA', visible: false },
                { name: 'EMOJI', visible: true },
                { name: 'MORE', visible: true },
              ]}
            />
          </div>
        </div>
      ) : (
        /* 文本模式 */
        <div className="cs-text-mode">
          <button
            type="button"
            className="cs-mode-switch-btn"
            onClick={switchToVoiceMode}
            title="语音输入"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
              <path d="M12 18v4" />
              <path d="M8 22h8" />
            </svg>
          </button>

          <div className="cs-text-input-wrapper">
            <MessageInput
              {...props}
              actions={[
                { name: 'RECORDER', visible: false },
                { name: 'TEXTAREA', visible: true },
                { name: 'EMOJI', visible: true },
                { name: 'MORE', visible: true },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMessageInput;
