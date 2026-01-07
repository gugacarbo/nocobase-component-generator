applyTo: "\*"

# NocoBase Component Generator - Copilot Instructions

## Visão Geral do Projeto

Este é um gerador/bundler de componentes React para NocoBase que permite:

- Desenvolver componentes multi-arquivo em TypeScript/TSX
- Visualizar componentes em tempo real com hot-reload
- Fazer bundle de componentes para um único arquivo JavaScript compatível com NocoBase
- Transformar imports de bibliotecas externas para usar o contexto

## Instruções Gerais

- Responda sempre em português BR.
- Forneça instruções detalhadas e específicas.
- Não gere arquivos de documentação ou de testes a menos que seja solicitado.
- Inclua o mínimo de comentários de código, use somente quando muito necessário.
- Use uma linguagem clara e concisa.
- Estruture as instruções em seções lógicas com títulos apropriados.
- Priorize boas práticas de desenvolvimento e padrões de codificação.

## Padrões de Código

### Nomenclatura

- Use **camelCase** para variáveis e funções: `getUserData()`, `isValid`
- Use **PascalCase** para classes e componentes: `UserService`, `DataProcessor`
- Use **UPPER_SNAKE_CASE** para constantes: `MAX_RETRY_COUNT`, `API_BASE_URL`
- Use nomes descritivos e significativos que expressem a intenção do código
- Evite abreviações desnecessárias, exceto convenções conhecidas (id, url, api)

### Estrutura de Código

- Mantenha funções pequenas e com responsabilidade única
- Limite funções a no máximo 20-30 linhas quando possível
- Agrupe código relacionado em módulos/arquivos separados
- Organize imports/requires no topo do arquivo
- Declare variáveis próximas ao seu primeiro uso

### Formatação

- Use **2 espaços** para indentação (ou 4 se for Python)
- Limite linhas a 80-100 caracteres
- Adicione linha em branco entre blocos lógicos de código
- Use aspas simples `'` para strings (exceto quando a linguagem preferir aspas duplas)
- Inclua vírgula final em arrays e objetos multi-linha quando a linguagem permitir

### Tratamento de Erros

- Sempre trate erros de forma explícita
- Use try-catch ou equivalente da linguagem para operações que podem falhar
- Retorne erros de forma consistente (exceptions, error objects, etc)
- Valide inputs no início das funções

### Princípios de Design

- Aplique **DRY** (Don't Repeat Yourself): evite duplicação de código
- Aplique **KISS** (Keep It Simple, Stupid): prefira soluções simples
- Aplique **YAGNI** (You Aren't Gonna Need It): não adicione funcionalidades desnecessárias
- Favoreça composição sobre herança
- Programe para interfaces, não implementações

### Segurança

- Nunca exponha credenciais ou chaves de API no código
- Use variáveis de ambiente para dados sensíveis
- Valide e sanitize todos os inputs de usuário
- Evite eval() ou equivalentes que executem código dinâmico

### Performance

- Evite loops desnecessários ou aninhados profundamente
- Use estruturas de dados apropriadas para cada situação
- Considere lazy loading quando apropriado
- Evite operações síncronas bloqueantes em I/O

### Código Assíncrono

- Prefira async/await sobre callbacks quando disponível
- Trate erros em operações assíncronas adequadamente
- Evite pyramid of doom (callback hell)

### Retorno de Funções

- Seja consistente no tipo de retorno
- Retorne cedo para reduzir aninhamento (early return pattern)
- Evite múltiplos pontos de retorno quando tornar o código confuso

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
