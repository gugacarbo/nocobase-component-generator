import MyComponent from './components/MyComponent'

function App() {
  return (
    <div>
      <h1>NocoBase Component Generator - Development Mode</h1>
      
      <div className="component-preview">
        <h2>Preview do Componente</h2>
        <MyComponent />
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Como usar:</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Desenvolva seus componentes na pasta <code>src/components/</code></li>
          <li>Use <code>pnpm dev</code> para ver em tempo real</li>
          <li>Quando terminar, execute <code>pnpm bundle</code></li>
          <li>O arquivo único estará em <code>output/bundled-component.jsx</code></li>
          <li>Copie o conteúdo e cole no NocoBase v2</li>
        </ol>
      </div>
    </div>
  )
}

export default App
