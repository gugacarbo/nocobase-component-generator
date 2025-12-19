# NocoBase Component Generator

Desenvolva componentes React com TypeScript em múltiplos arquivos e transforme em um único arquivo para usar no NocoBase v2.

## 🚀 Como Usar

### 1. Instalação

```bash
pnpm install
```

### 2. Desenvolvimento

```bash
pnpm dev
```

Isso abrirá um servidor local onde você pode ver seus componentes em tempo real com hot reload.

### 3. Criar seu componente

Edite os arquivos em `src/components/`:

- `MyComponent.tsx` - Seu componente principal
- `ui/Button.tsx` - Componentes reutilizáveis
- `MyComponent.module.css` - Estilos CSS Modules

Use utilitários em `src/utils/`:

- `dateUtils.ts` - Funções auxiliares

### 4. Gerar arquivo único

```bash
pnpm bundle
```

Isso criará um arquivo em `output/bundled-component.jsx` com todo o código em um único arquivo.

### 5. Usar no NocoBase

1. Abra o arquivo `output/bundled-component.jsx`
2. Copie todo o conteúdo
3. Cole no campo de JS Field do NocoBase v2
4. Pronto! 🎉

## 📁 Estrutura do Projeto

```
src/
  ├── components/       # Seus componentes React
  │   ├── MyComponent.tsx
  │   ├── MyComponent.module.css
  │   └── ui/
  │       └── Button.tsx
  ├── utils/           # Funções auxiliares
  │   └── dateUtils.ts
  ├── App.tsx          # App de preview
  ├── main.tsx         # Entry point do dev
  └── bundler.ts       # Script de bundling
```

## 🔧 Configuração

Para mudar o componente que será bundleado, edite `src/bundler.ts`:

```typescript
const defaultConfig: BundlerConfig = {
  entryPoint: path.resolve(__dirname, '../src/components/SeuComponente.tsx'),
  outputFile: path.resolve(__dirname, '../output/seu-componente.jsx'),
  componentName: 'SeuComponente',
}
```

## 💡 Dicas

- Use CSS Modules para estilos isolados
- Crie componentes reutilizáveis em `src/components/ui/`
- Coloque funções auxiliares em `src/utils/`
- O React já está disponível no NocoBase, não precisa importar

## 🎯 Exemplo Prático

Veja o exemplo em `src/components/MyComponent.tsx` que demonstra:

- ✅ Uso de hooks (useState)
- ✅ Importação de utilitários
- ✅ Uso de componentes filhos
- ✅ CSS Modules
- ✅ TypeScript

Tudo isso será bundleado em um único arquivo!
