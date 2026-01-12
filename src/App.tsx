import type { ReactNode } from 'react';
import './App.css';

// 这是UIKIT Provider的容器组件
// 实际的UIKIT Provider将在这里初始化
interface AppProps {
  children?: ReactNode;
}

function App({ children }: AppProps) {
  // 注意：在实际使用中，您需要在这里导入并使用环信UIKIT的Provider
  // 例如：
  // import { UIKitProvider } from 'easemob-uikit';
  // return (
  //   <UIKitProvider config={/* 您的配置 */}>
  //     {children}
  //   </UIKitProvider>
  // );
  
  return (
    <div className="app-container">
      {children}
    </div>
  );
}

export default App;
