# Guia Rápido - NocoBase Component Generator

## Instalação

```bash
git clone <repository-url>
cd nocobase-component-generator
pnpm install
```

## Comandos Principais

```bash
# Desenvolvimento com hot reload
pnpm dev

# Gerar bundle de um componente
pnpm bundle components/ui/Button.tsx

# Gerar todos os bundles
pnpm bundle:all

# Build para produção
pnpm build
```

## Criar Seu Primeiro Componente

### 1. Crie o arquivo

```bash
mkdir -p components/my-components
```

```tsx
// components/my-components/HelloWorld.tsx
import { Button } from 'antd';

const defaultProps = {
  name: "World"
};

export default function HelloWorld({ name = "World" }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <Button type="primary">Click Me</Button>
    </div>
  );
}
```

### 2. Visualize localmente

```bash
pnpm dev
```

Abra `http://localhost:5173` e selecione seu componente na árvore.

### 3. Gere o bundle

```bash
pnpm bundle components/my-components/HelloWorld.tsx
```

Bundle gerado em: `output/my-components/hello-world.js`

### 4. Use no NocoBase

Copie o conteúdo de `output/my-components/hello-world.js` e cole no NocoBase.

## Estrutura de Projeto

```
components/          # Seus componentes (edite aqui)
├── ui/             # Componentes de UI
├── form-inputs/    # Inputs customizados
└── CRM/            # Módulos de negócio

output/             # Bundles gerados (não edite)
└── ...

src/                # Código do generator (não edite)
└── ...
```

## Imports Permitidos

✅ **Funcionam no NocoBase:**
```tsx
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'antd';
import { useRequest, useForm } from '@nocobase/client';
```

❌ **Não funcionam:**
```tsx
import axios from 'axios';       // Use useRequest
import moment from 'moment';     // Use dayjs
import lodash from 'lodash';     // Use métodos nativos
```

## Comentários Especiais

```tsx
// //bundle-only
console.log('Só no bundle final');

// //no-bundle  
console.log('Só durante desenvolvimento');
```

## Props Padrão

```tsx
const defaultProps = {
  title: "Default Title",
  size: "medium"
};

export default function MyComponent(props) {
  const { title, size } = { ...defaultProps, ...props };
  return <div>{title}</div>;
}
```

## Componente Multi-Arquivo

```
components/
└── my-feature/
    ├── index.tsx          # Componente principal
    ├── types.ts           # Tipos TypeScript
    ├── utils.ts           # Funções auxiliares
    └── components/
        └── SubComponent.tsx
```

```tsx
// components/my-feature/index.tsx
import { SubComponent } from './components/SubComponent';
import { formatData } from './utils';

export default function MyFeature() {
  return <SubComponent data={formatData()} />;
}
```

## Hooks NocoBase

### useRequest - Requisições HTTP

```tsx
import { useRequest } from '@nocobase/client';

function MyComponent() {
  const { data, loading, run } = useRequest({
    url: '/api/endpoint',
    manual: true
  });

  return (
    <button onClick={run}>
      {loading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
}
```

### useForm - Formulários

```tsx
import { useForm } from '@nocobase/client';
import { Form, Input, Button } from 'antd';

function MyForm() {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.Item name="name">
        <Input />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
}
```

## Dicas Rápidas

### 1. Use Verbose Mode

```bash
LOG_VERBOSE=true pnpm dev
LOG_VERBOSE=true pnpm bundle components/Button.tsx
```

### 2. Verifique Erros

Erros aparecem no console durante `pnpm dev`.

### 3. Teste Antes de Fazer Bundle

Sempre teste no modo dev antes de gerar bundle.

### 4. Logs em Arquivo

Logs salvos em: `logs/app-YYYY-MM-DD.log`

### 5. Bundle Vazio?

- Verifique se tem `export default`
- Veja se arquivo está em `components/`
- Confirme extensão: `.tsx`, `.ts`, `.jsx`, `.js`

## Troubleshooting

### Componente não aparece na árvore

- Arquivo deve ter `export default`
- Deve estar em `components/`
- Reinicie servidor: `Ctrl+C` e `pnpm dev`

### Erro "Module not found"

```bash
pnpm install
```

### Hot reload não funciona

Reinicie o servidor.

### Bundle com erro

Verifique logs em `logs/` ou use modo verbose.

## Próximos Passos

1. ✅ Leia [README.md](../README.md) - Visão geral
2. 📚 Explore [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada
3. 🔧 Veja [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento
4. 🚀 Consulte [NOCOBASE.md](./NOCOBASE.md) - Integrações NocoBase
5. 📖 Consulte [BUNDLER_API.md](./BUNDLER_API.md) - API completa

## Exemplos

### Exemplo 1: Botão Simples

```tsx
// components/ui/SimpleButton.tsx
import { Button } from 'antd';

const defaultProps = {
  text: "Click Me",
  type: "primary"
};

export default function SimpleButton(props) {
  const { text, type } = { ...defaultProps, ...props };
  
  return (
    <Button type={type}>
      {text}
    </Button>
  );
}
```

### Exemplo 2: Contador

```tsx
// components/examples/Counter.tsx
import { useState } from 'react';
import { Button, Typography } from 'antd';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Typography.Title level={3}>
        Count: {count}
      </Typography.Title>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### Exemplo 3: Lista de Dados

```tsx
// components/examples/DataList.tsx
import { useRequest } from '@nocobase/client';
import { List, Spin } from 'antd';

export default function DataList() {
  const { data, loading } = useRequest({
    resource: 'users',
    action: 'list'
  });

  if (loading) return <Spin />;

  return (
    <List
      dataSource={data?.data}
      renderItem={item => (
        <List.Item>{item.name}</List.Item>
      )}
    />
  );
}
```

## Suporte

- 📧 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions
- 📚 Docs: `/docs` folder

---

**Boa sorte com seus componentes! 🚀**
