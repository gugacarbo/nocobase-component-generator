# Integrações NocoBase

Guia completo sobre como o generator integra com a plataforma NocoBase.

## Visão Geral

O NocoBase Component Generator transforma componentes React multi-arquivo em bundles JavaScript compatíveis com o sistema de componentes do NocoBase.

## Arquitetura NocoBase

### Sistema de Contexto

O NocoBase fornece um objeto de contexto global (`ctx`) que contém:

```typescript
interface NocoBaseContext {
  libs: {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    NocobaseClient: typeof import('@nocobase/client');
    Antd: typeof import('antd');
    // ... outras bibliotecas
  };
  render: (element: React.ReactElement) => void;
  // ... outros recursos
}
```

### Como Funciona

1. **NocoBase carrega o bundle**: `eval()` ou `<script>`
2. **Bundle acessa ctx.libs**: Obtém bibliotecas do contexto
3. **Bundle renderiza**: Usa `ctx.render()` para exibir componente

## Transformação de Imports

### Processo

O `NocoBaseAdapter` transforma imports padrão em destructuring do ctx:

```typescript
// ❌ Código Original
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { useRequest } from '@nocobase/client';

// ✅ Bundle Gerado
const { React, useState, useEffect } = ctx.libs.React;
const { Button, Modal } = ctx.libs.Antd;
const { useRequest } = ctx.libs.NocobaseClient;
```

### Mapeamento de Bibliotecas

Configurado em `src/config/bundler-config.ts`:

```typescript
LIBRARY_MAPPINGS: {
  // React ecosystem
  'react': 'React',
  'react-dom': 'ReactDOM',
  'react-router-dom': 'ReactRouterDom',
  
  // NocoBase
  '@nocobase/client': 'NocobaseClient',
  '@nocobase/sdk': 'NocobaseSdk',
  
  // UI Libraries
  'antd': 'Antd',
  '@ant-design/icons': 'AntdIcons',
  
  // Utilities
  'dayjs': 'Dayjs',
  'axios': 'Axios',
  'lodash': 'Lodash',
}
```

### Adicionar Novo Mapeamento

```typescript
// bundler-config.ts
LIBRARY_MAPPINGS: {
  // ... mapeamentos existentes
  'custom-library': 'CustomLibrary',
}
```

## Renderização

### ctx.render()

O NocoBase espera que o bundle use `ctx.render()`:

```javascript
// Bundle gerado
ctx.render(<MyComponent {...defaultProps} />);
```

### Geração Automática

O bundler adiciona automaticamente:

```typescript
// NocoBaseAdapter.generateRender()
public static generateRender(
  componentName: string,
  defaultProps?: string | null
): string {
  return `
ctx.render(<${componentName} ${defaultProps ? '{...defaultProps}' : ''} />);

// === === Components === ===
 
`;
}
```

## Props Padrão

### Definição

Defina props padrão em seu componente:

```typescript
// components/ui/Button.tsx
const defaultProps = {
  type: "primary",
  size: "medium",
  label: "Click Me"
};

export default function Button(props: ButtonProps) {
  const { type, size, label } = { ...defaultProps, ...props };
  return <button className={`btn-${type} btn-${size}`}>{label}</button>;
}
```

### No Bundle

O bundler extrai e mantém defaultProps:

```javascript
// Bundle gerado
const defaultProps = {
  type: "primary",
  size: "medium",
  label: "Click Me"
};

ctx.render(<Button {...defaultProps} />);

// === === Components === ===

function Button(props) {
  const { type, size, label } = { ...defaultProps, ...props };
  return /* ... */;
}
```

### Override pelo NocoBase

O NocoBase pode sobrescrever props:

```javascript
// No NocoBase
const componentProps = {
  type: "secondary",  // Override
  size: "large",      // Override
  onClick: () => {}   // Nova prop
};

// Resultado final
{
  type: "secondary",
  size: "large",
  label: "Click Me",  // Do defaultProps
  onClick: () => {}
}
```

## Comentários Especiais

### //bundle-only

Código que só aparece no bundle final:

```typescript
export default function Component() {
  // //bundle-only
  console.log('Este log só existe no bundle');
  
  // Código normal sempre presente
  return <div>Hello</div>;
}
```

**Uso:**
- Código específico para produção
- Otimizações que só fazem sentido no bundle
- Fallbacks para ambiente NocoBase

### //no-bundle

Código removido do bundle:

```typescript
export default function Component() {
  // //no-bundle
  console.log('Este log só existe em desenvolvimento');
  
  // //no-bundle
  if (process.env.NODE_ENV === 'development') {
    // Debug code
  }
  
  return <div>Hello</div>;
}
```

**Uso:**
- Código de desenvolvimento
- Debugging tools
- Mocks e fixtures

### Processamento

```typescript
// CommentProcessor.ts
public static processComments(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let skipNext = false;
  let bundleOnlyMode = false;

  for (const line of lines) {
    if (line.trim().startsWith("// //no-bundle")) {
      skipNext = true;
      continue;
    }
    
    if (line.trim().startsWith("// //bundle-only")) {
      bundleOnlyMode = true;
      continue;
    }

    if (!skipNext || bundleOnlyMode) {
      result.push(line);
    }
    
    skipNext = false;
  }

  return result.join("\n");
}
```

## Hooks NocoBase

### useRequest

Hook para requisições HTTP:

```typescript
import { useRequest } from '@nocobase/client';

function MyComponent() {
  const { data, loading, error, run } = useRequest({
    url: '/api/endpoint',
    method: 'GET'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

**No Bundle:**
```javascript
const { useRequest } = ctx.libs.NocobaseClient;

function MyComponent() {
  const { data, loading, error, run } = useRequest({
    url: '/api/endpoint',
    method: 'GET'
  });
  // ...
}
```

### useForm

Hook para formulários:

```typescript
import { useForm } from '@nocobase/client';

function MyForm() {
  const { form, submit } = useForm({
    initialValues: { name: '' }
  });

  return (
    <form onSubmit={submit}>
      <input {...form.register('name')} />
    </form>
  );
}
```

### useCollection

Hook para acessar collections:

```typescript
import { useCollection } from '@nocobase/client';

function MyComponent() {
  const collection = useCollection('users');
  
  return <div>{collection.name}</div>;
}
```

## Componentes NocoBase

### SchemaComponent

Renderiza schema-based components:

```typescript
import { SchemaComponent } from '@nocobase/client';

function MyComponent() {
  const schema = {
    type: 'void',
    'x-component': 'Grid',
    properties: {
      row1: {
        type: 'void',
        'x-component': 'Grid.Row',
        // ...
      }
    }
  };

  return <SchemaComponent schema={schema} />;
}
```

### FormProvider

Provedor de contexto de formulário:

```typescript
import { FormProvider, FormItem, Input } from '@nocobase/client';

function MyForm() {
  return (
    <FormProvider>
      <FormItem name="username" label="Username">
        <Input />
      </FormItem>
      <FormItem name="email" label="Email">
        <Input type="email" />
      </FormItem>
    </FormProvider>
  );
}
```

## APIs NocoBase

### API Client

Acesso à API REST:

```typescript
import { APIClient } from '@nocobase/client';

function MyComponent() {
  const api = new APIClient();

  const fetchData = async () => {
    const response = await api.request({
      url: '/api/collections/users:list',
      method: 'GET'
    });
    return response.data;
  };

  // ...
}
```

### Collection Manager

Gerenciamento de collections:

```typescript
import { useCollectionManager } from '@nocobase/client';

function MyComponent() {
  const cm = useCollectionManager();
  
  const collections = cm.getCollections();
  const fields = cm.getCollectionFields('users');
  
  // ...
}
```

## Estrutura de Arquivo NocoBase

### Single File Component

Para upload direto no NocoBase:

```javascript
// button-component.js
const { React, useState } = ctx.libs.React;
const { Button } = ctx.libs.Antd;

const defaultProps = {
  type: "primary"
};

ctx.render(<ButtonComponent {...defaultProps} />);

// === === Components === ===

function ButtonComponent(props) {
  const [count, setCount] = useState(0);
  
  return (
    <Button 
      type={props.type}
      onClick={() => setCount(count + 1)}
    >
      Clicked {count} times
    </Button>
  );
}
```

### Upload no NocoBase

1. **Via Interface:**
   ```
   Settings → UI Editor → Components → Add Component
   Cole o código do bundle
   ```

2. **Via API:**
   ```bash
   curl -X POST http://localhost:13000/api/uiSchemas:insert \
     -H "Content-Type: application/json" \
     -d '{
       "name": "ButtonComponent",
       "code": "/* bundle code */"
     }'
   ```

## Mocks para Desenvolvimento

### ctx Mock

Para testar localmente sem NocoBase:

```typescript
// src/nocobase/ctx.ts
import * as React from 'react';
import * as Antd from 'antd';
import * as NocobaseClient from '@nocobase/client';

export const ctx = {
  libs: {
    React,
    Antd,
    NocobaseClient,
  },
  render: (element: React.ReactElement) => {
    // Implementação mock
    const root = document.getElementById('root');
    if (root) {
      const { createRoot } = require('react-dom/client');
      createRoot(root).render(element);
    }
  }
};

// Para desenvolvimento
(window as any).ctx = ctx;
```

### Mock Files

Arquivos terminados em `.mock.ts` são ignorados no bundle:

```typescript
// Button.mock.ts
export const mockData = {
  label: "Test Button",
  type: "primary"
};

// Button.tsx
// //no-bundle
import { mockData } from './Button.mock';

export default function Button() {
  // //no-bundle
  const devData = mockData;
  
  return <button>Click</button>;
}
```

## Integração com Collections

### Acessar Dados

```typescript
import { useRequest } from '@nocobase/client';

function UsersList() {
  const { data, loading } = useRequest({
    resource: 'users',
    action: 'list',
  });

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Criar Registro

```typescript
import { useRequest } from '@nocobase/client';

function CreateUser() {
  const { run, loading } = useRequest({
    resource: 'users',
    action: 'create',
    manual: true,
  });

  const handleSubmit = async (values) => {
    await run({ data: values });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Atualizar Registro

```typescript
import { useRequest } from '@nocobase/client';

function UpdateUser({ userId }) {
  const { run } = useRequest({
    resource: 'users',
    action: 'update',
    manual: true,
  });

  const handleUpdate = async (values) => {
    await run({
      filterByTk: userId,
      values: values
    });
  };

  return <form onSubmit={handleUpdate}>...</form>;
}
```

## Estilos

### Antd Theming

O NocoBase usa Antd, que já está estilizado:

```typescript
import { Button, Card, Space } from 'antd';

function StyledComponent() {
  return (
    <Card>
      <Space>
        <Button type="primary">Primary</Button>
        <Button type="default">Default</Button>
        <Button danger>Danger</Button>
      </Space>
    </Card>
  );
}
```

### CSS Inline

```typescript
function Component() {
  return (
    <div style={{
      padding: '20px',
      background: '#f0f0f0',
      borderRadius: '8px'
    }}>
      Content
    </div>
  );
}
```

### CSS Modules (Desenvolvimento)

Durante desenvolvimento, você pode usar CSS modules:

```css
/* Button.module.css */
.button {
  padding: 10px 20px;
  background: blue;
}
```

```typescript
// Button.tsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click</button>;
}
```

**Nota:** CSS modules não são incluídos no bundle. Use Antd ou inline styles para bundles.

## Limitações

### 1. Imports Externos

Apenas bibliotecas disponíveis em `ctx.libs` funcionam:

```typescript
// ✅ OK - Disponível no NocoBase
import { useState } from 'react';
import { Button } from 'antd';

// ❌ Não funciona - Não disponível
import moment from 'moment';
import axios from 'axios';
```

**Solução:**
- Use bibliotecas do NocoBase
- Ou adicione biblioteca ao ctx do NocoBase

### 2. Código Assíncrono no Nível Superior

```typescript
// ❌ Não funciona
const data = await fetch('/api/data');

export default function Component() {
  return <div>{data}</div>;
}

// ✅ OK - Dentro de componente
export default function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);
  
  return <div>{data}</div>;
}
```

### 3. Variáveis Globais

```typescript
// ❌ Evite
window.myVar = 123;
global.config = {};

// ✅ Use estado local
function Component() {
  const [myVar] = useState(123);
  // ...
}
```

### 4. Tamanho do Bundle

Bundles muito grandes podem ter problemas:

```typescript
// ❌ Evite arquivos gigantes
// Divida em componentes menores

// ✅ OK - Componentes modulares
import SubComponent1 from './SubComponent1';
import SubComponent2 from './SubComponent2';
```

## Debugging em Produção

### Console Logging

```typescript
export default function Component() {
  // //bundle-only
  console.log('[NocoBase] Component mounted');
  
  return <div>Content</div>;
}
```

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[NocoBase Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

export default function MyComponent() {
  return (
    <ErrorBoundary>
      <ActualComponent />
    </ErrorBoundary>
  );
}
```

## Melhores Práticas

### 1. Use TypeScript Durante Desenvolvimento

```typescript
// Durante desenvolvimento
interface Props {
  title: string;
  onSave: () => void;
}

export default function Component({ title, onSave }: Props) {
  // Tipos garantem segurança
}

// Bundle JavaScript gerado será sem tipos
```

### 2. Separe Lógica de UI

```typescript
// hooks/useUserData.ts
export function useUserData() {
  const [users, setUsers] = useState([]);
  // Lógica
  return { users };
}

// UsersList.tsx
import { useUserData } from './hooks/useUserData';

export default function UsersList() {
  const { users } = useUserData();
  return <ul>...</ul>;
}
```

### 3. Use Comentários Especiais

```typescript
export default function Component() {
  // //no-bundle
  console.log('Development only');
  
  // //bundle-only
  console.log('Production only');
  
  return <div>Content</div>;
}
```

### 4. Teste Localmente Primeiro

```bash
# 1. Desenvolva com hot reload
pnpm dev

# 2. Gere bundle
pnpm bundle components/MyComponent.tsx

# 3. Verifique bundle gerado
cat output/my-component.js

# 4. Upload no NocoBase
```

### 5. Mantenha Bundles Pequenos

- Remova código não utilizado
- Use tree shaking
- Evite dependências pesadas
- Divida em componentes menores

## Exemplos Completos

### Exemplo 1: Lista de Usuários

```typescript
// UsersList.tsx
import { useRequest } from '@nocobase/client';
import { Table } from 'antd';

const defaultProps = {
  pageSize: 10
};

export default function UsersList(props) {
  const { pageSize } = { ...defaultProps, ...props };
  
  const { data, loading } = useRequest({
    resource: 'users',
    action: 'list',
    params: { pageSize }
  });

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <Table
      dataSource={data?.data}
      columns={columns}
      loading={loading}
      pagination={{ pageSize }}
    />
  );
}
```

### Exemplo 2: Formulário de Criação

```typescript
// CreateUser.tsx
import { useRequest } from '@nocobase/client';
import { Form, Input, Button, message } from 'antd';

export default function CreateUser() {
  const [form] = Form.useForm();
  
  const { run, loading } = useRequest({
    resource: 'users',
    action: 'create',
    manual: true,
  });

  const handleSubmit = async (values) => {
    try {
      await run({ data: values });
      message.success('User created successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to create user');
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create
        </Button>
      </Form.Item>
    </Form>
  );
}
```

## Recursos Adicionais

- [NocoBase Documentation](https://docs.nocobase.com/)
- [NocoBase GitHub](https://github.com/nocobase/nocobase)
- [Ant Design](https://ant.design/)
- [React Documentation](https://react.dev/)
