import './App.css';

function App() {
  return (
    <div className="h5-container">
      <header className="h5-header">
        <h1>H5项目模板</h1>
      </header>
      
      <main className="h5-main">
        <section className="h5-content">
          <h2>欢迎使用H5项目模板</h2>
          <p>这是一个基于React + TypeScript + Vite的移动端项目模板</p>
          
          <div className="features">
            <div className="feature-item">
              <h3>📱 响应式设计</h3>
              <p>适配各种移动设备屏幕尺寸</p>
            </div>
            
            <div className="feature-item">
              <h3>⚡ 快速构建</h3>
              <p>基于Vite的快速开发体验</p>
            </div>
            
            <div className="feature-item">
              <h3>📝 TypeScript</h3>
              <p>类型安全，提升开发效率</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="h5-footer">
        <p>H5项目模板 © 2026</p>
      </footer>
    </div>
  );
}

export default App;
