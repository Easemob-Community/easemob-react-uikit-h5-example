import type { ReactNode } from 'react';

interface AppProps {
  children?: ReactNode;
}

function App({ children }: AppProps) {
  // 主应用组件，负责基础布局容器
  return (
    <div className="app-container">
      {children}
    </div>
  );
}

export default App;