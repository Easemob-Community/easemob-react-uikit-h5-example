/**
 * 移动端适配方案 - flexible.js 简化版
 * 用于处理不同移动设备的像素比和屏幕适配问题
 */

(function () {
  const docEl = document.documentElement;
  const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

  /**
   * 设置根元素字体大小
   */
  function setRootFontSize() {
    const clientWidth = docEl.clientWidth;
    if (!clientWidth) return;

    // 设计稿基准宽度为750px，基准字体大小为32px
    // 可根据实际设计稿调整
    let fontSize = 32;
    if (clientWidth >= 750) {
      fontSize = 32; // 750px设计稿对应32px字体大小
    } else {
      fontSize = (clientWidth / 750) * 32;
    }

    docEl.style.fontSize = fontSize + 'px';
  }

  // 绑定事件
  window.addEventListener(resizeEvt, setRootFontSize, false);
  document.addEventListener('DOMContentLoaded', setRootFontSize, false);

  // 初始化
  setRootFontSize();
})();