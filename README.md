# NocoBase Component Generator

Gerador e bundler de componentes React para NocoBase que permite desenvolver componentes multi-arquivo em TypeScript/TSX e gerar bundles compatíveis com a plataforma NocoBase.

## 🚀 Características

- **Desenvolvimento Multi-Arquivo**: Organize seu código em múltiplos arquivos TypeScript/TSX
- **Hot Reload**: Visualize mudanças em tempo real durante o desenvolvimento
- **Bundling Inteligente**: Gera bundles otimizados compatíveis com NocoBase
- **Tree Shaking**: Remove código não utilizado automaticamente
- **Transformação de Imports**: Converte imports externos para usar o contexto NocoBase
- **Suporte TypeScript**: Suporte completo com verificação de tipos
- **Visualizador Integrado**: Interface para testar componentes antes do deploy

## 📋 Pré-requisitos

- Node.js >= 16
- pnpm (gerenciador de pacotes recomendado)

## 🔧 Instalação

```bash
# Clone o repositório
git clone <repository-url>

# Instale as dependências
pnpm install
```

## 🎯 Uso Rápido

### Modo Desenvolvimento

Inicie o servidor de desenvolvimento com hot reload:

```bash
pnpm dev
```

Acesse `http://localhost:5173` para visualizar e testar seus componentes.

### Gerar Bundle

Gere o bundle de um componente específico:

```bash
pnpm bundle <caminho-do-componente>
```

Exemplo:
```bash
pnpm bundle components/ui/Button.tsx
```

### Gerar Todos os Bundles

```bash
pnpm bundle:all
```

## 📁 Estrutura do Projeto

```
nocobase-component-generator/
├── components/          # Seus componentes fonte
│   ├── ui/             # Componentes de UI
│   ├── form-inputs/    # Inputs de formulário
│   └── CRM/            # Módulos específicos
├── output/             # Bundles gerados
├── src/
│   ├── app/           # Interface do visualizador
│   ├── bundler/       # Sistema de bundling
│   ├── nocobase/      # Integrações NocoBase
│   ├── server/        # API Express
│   └── common/        # Utilitários compartilhados
└── logs/              # Logs do sistema
```

## 📝 Criando Componentes

### 1. Estrutura Básica

Crie seus componentes em `components/`:

```tsx
// components/ui/MyButton.tsx
import { Button } from "@nocobase/client";

export default function MyButton() {
  return <Button type="primary">Clique Aqui</Button>;
}
```

### 2. Componentes Multi-Arquivo

```
components/
└── my-feature/
    ├── index.tsx          # Componente principal
    ├── types.ts           # Tipos TypeScript
    ├── utils.ts           # Funções auxiliares
    └── components/
        └── SubComponent.tsx
```

### 3. Props Padrão

Use `defaultProps` para definir props padrão:

```tsx
const defaultProps = {
  title: "Título Padrão",
  size: "medium",
};

export default function MyComponent(props: Props) {
  // ...
}
```

## 🔄 Processo de Bundling

1. **Carregamento**: Carrega todos os arquivos do componente
2. **Análise de Dependências**: Resolve imports e ordena arquivos
3. **Tree Shaking**: Remove código não utilizado
4. **Transformação**: Converte imports para contexto NocoBase
5. **Geração**: Cria bundles TypeScript e JavaScript

## 🎨 Recursos Avançados

### Comentários Especiais

```tsx
// //bundle-only
// Este código só aparece no bundle final
const bundleOnlyCode = () => {};

// //no-bundle
// Este código é removido do bundle
const devOnlyCode = () => {};
```

### Imports Externos

O bundler converte automaticamente:

```tsx
// Antes
import { useState } from 'react';
import { Button } from '@nocobase/client';

// Depois (no bundle)
const { useState } = ctx.libs.React;
const { Button } = ctx.libs.NocobaseClient;
```

### Aliases de Path

Use aliases configurados em `tsconfig.json`:

```tsx
import { Logger } from '@common/Logger';
import { PathUtils } from '@bundler/utils';
```

## ⚙️ Configuração

### Configuração do Bundler

Edite `src/config/bundler-config.ts`:

```typescript
export const BUNDLER_CONFIG = {
  OUTPUT_EXTENSION: ".js",
  exportTypescript: false,
  FILE_EXTENSIONS: /\.(tsx?|jsx?)$/,
  // ...
};
```

### Variáveis de Ambiente

Crie um arquivo `.env`:

```env
PORT=5173
LOG_VERBOSE=true
```

## 🧪 Testes

```bash
# Execute testes (quando disponíveis)
pnpm test
```

## 📊 Logging

O sistema usa logging em dois modos:

### Modo Normal
```bash
pnpm dev
```

### Modo Verbose
```bash
LOG_VERBOSE=true pnpm dev
```

Logs são salvos em `logs/app-YYYY-MM-DD.log`

## 🐛 Troubleshooting

### Erro: "Nenhum componente encontrado"
- Verifique se o arquivo tem `export default`
- Confirme que está em `components/`

### Erro: "Path não encontrado"
- Verifique se o caminho está correto
- Confirme que os aliases estão configurados

### Bundle vazio
- Verifique se há código não utilizado
- Desabilite tree shaking temporariamente

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📚 Documentação Adicional

- [Arquitetura](docs/ARCHITECTURE.md)
- [API do Bundler](docs/BUNDLER_API.md)
- [Guia de Desenvolvimento](docs/DEVELOPMENT.md)
- [Integrações NocoBase](docs/NOCOBASE.md)

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

Desenvolvido para a comunidade NocoBase.

## 🙏 Agradecimentos

- NocoBase Team
- Comunidade React
- Todos os contribuidores
