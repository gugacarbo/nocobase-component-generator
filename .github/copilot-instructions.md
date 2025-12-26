applyTo: "\*"

# NocoBase Component Generator - Copilot Instructions

## Instruções Gerais

- Responda sempre em português BR.
- Forneça instruções detalhadas e específicas.
- Não gere arquivos de documentação ou de testes a menos que seja solicitado.
- Inclua o mínimo de comentários de código, use somente quando muito necessário.
- Use uma linguagem clara e concisa.
- Estruture as instruções em seções lógicas com títulos apropriados.
- Priorize boas práticas de desenvolvimento e padrões de codificação.

## Visão Geral do Projeto

Este é um gerador/bundler de componentes React para NocoBase que permite:

- Desenvolver componentes multi-arquivo em TypeScript/TSX
- Visualizar componentes em tempo real com hot-reload
- Fazer bundle de componentes para um único arquivo JavaScript compatível com NocoBase
- Transformar imports de bibliotecas externas para usar o contexto NocoBase (`ctx.libs`)

## Arquitetura do Projeto

### Estrutura de Diretórios

```
components/         # Componentes fonte (TSX/TypeScript)
output/            # Componentes gerados (bundle JavaScript)
src/
  app/             # Interface do visualizador de componentes
  bundler/         # Sistema de bundling
  nocobase/        # Integrações e mocks do NocoBase
  server/          # API Express para bundling
```

## Convenções e Padrões

### 1. Imports de Bibliotecas Externas

Durante o desenvolvimento, use imports normais:

```typescript
import { Button } from "antd";
import { useState } from "react";
```

O bundler transforma automaticamente para o contexto NocoBase:

```javascript
const { Button } = ctx.libs.antd;
const { useState } = ctx.libs.React;
```

Bibliotecas suportadas (mapeamento automático):

- `react` → `ctx.libs.React`
- `react-dom` → `ctx.libs.ReactDOM`
- `antd` → `ctx.libs.antd`
- `@ant-design/icons` → `ctx.libs.antdIcons`
- `@formily/core` / `@formily/react` → `ctx.libs.formily`
- `@nocobase/client` → `ctx.libs.nocobase`
- `dayjs` → `ctx.libs.dayjs`
- `lodash` → `ctx.libs.lodash`

### 2. Comentários Especiais

#### `//bundle-only:`

Código que só deve aparecer no bundle final:

```typescript
//bundle-only: const value = ctx.getValue();
const value = "valor mock"; // usado durante desenvolvimento
```

No bundle, apenas `const value = ctx.getValue();` será incluído.

#### `//no-bundle`

Código marcado com `//no-bundle` será removido do bundle final:

```typescript
const debugInfo = "info de debug"; //no-bundle
```

## Sistema de Bundling

### Bundler

O orquestrador principal do bundling:

1. Carrega todos os arquivos do componente
2. Resolve dependências entre arquivos
3. Ordena arquivos por dependência
4. Remove código TypeScript
5. Aplica transformações NocoBase
6. Remove código não utilizado (tree-shaking)
7. Formata código final

### NocoBaseAdapter

Responsável por:

- Transformar imports para `ctx.libs`
- Processar comentários `//bundle-only`
- Remover comentários desnecessários
- Adaptar código para ambiente NocoBase

### Uso do Bundler

```typescript
const bundler = new SimpleBundler(
	"components/meu-componente", // caminho fonte
	"output", // diretório saída
	false, // exportar TypeScript?
	{ adapter: "nocobase" }, // opções
);
await bundler.bundle();
```

## Desenvolvimento

### Ambiente de Desenvolvimento

```bash
pnpm dev          # Inicia visualizador com Vite (UI)
pnpm dev:server   # Inicia servidor API de bundling
```

### Fluxo de Trabalho

1. Crie novo componente em `/components/[nome]/`
2. Crie `ctx.mock.ts` para desenvolvimento local
3. Desenvolva o componente com hot-reload em `http://localhost:5173`
4. Use a UI para fazer bundle quando pronto
5. O arquivo bundled aparece em `/output/[nome]/`

## Boas Práticas

### ✅ FAZER

- Use TypeScript para desenvolvimento
- Crie mocks realistas do contexto NocoBase
- Mantenha componentes modulares e reutilizáveis
- Use tipos explícitos para props e state
- Componentes UI genéricos em `/components/ui/`
- Utilitários compartilhados em `/components/utils/`

### ❌ NÃO FAZER

- Não faça imports de Node.js internos em componentes
- Não use bibliotecas externas não mapeadas
- Não acesse DOM diretamente (use React refs)
- Não inclua código de build/teste no bundle
- Não modifique arquivos em `/output/` manualmente

## Configuração

### Extensões TypeScript

O projeto usa path aliases:

- `@bundler/*` → `src/bundler/*`
- `@common/*` → `src/common/*`
- `@nocobase/*` → `src/nocobase/*`
- `@app/*` → `src/app/*`
- `@components/*` → `components/*`

Configure em `tsconfig.json` e `vite.config.ts`.

## Logs e Debugging

O projeto usa um Logger customizado (`src/common/Logger.ts`):

```typescript
Logger.start("Iniciando processo");
Logger.success("Operação concluída");
Logger.error("Erro encontrado", error);
Logger.info("Detalhe adicional");
```

Todos os métodos de Logging possuem suporte para verbose mode.

```typescript
Logger.info.verbose("Log verbose"); // ativa logs detalhados
```

## Integração NocoBase

O código bundled é projetado para rodar no ambiente NocoBase onde:

- `ctx` é o objeto de contexto global
- `ctx.libs` contém bibliotecas como React, antd, etc.
- `ctx.api` fornece métodos de requisição HTTP
- `ctx.getValue()` / `ctx.setValue()` gerenciam valores de campo

---

**Ao escrever código para este projeto:**

1. Priorize TypeScript durante desenvolvimento
2. Use imports normais - o bundler transforma automaticamente
   3
