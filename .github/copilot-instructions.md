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
- Transformar imports de bibliotecas externas para usar o contexto

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

### Aliases

O projeto usa path aliases:

- `@bundler/*` → `src/bundler/*`
- `@common/*` → `src/common/*`
- `@nocobase/*` → `src/nocobase/*`
- `@app/*` → `src/app/*`
- `@components/*` → `components/*`

Configure em `tsconfig.json` e `vite.config.ts`.

### Logs e Debugging

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
