applyTo: "\*\*"

# NocoBase Component Generator - Copilot Instructions

## Instruções Gerais

- Responda sempre em português BR.
- Preferencialmente utilizar nomes de variáveis e funções em inglês, a menos que se trate de termos técnicos específicos do domínio.
- Forneça instruções detalhadas e específicas.
- Não gere arquivos de documentação ou de testes a menos que seja solicitado.
- Inclua o mínimo de comentários de código, use somente quando muito necessário.
- Use uma linguagem clara e concisa.
- Estruture as instruções em seções lógicas com títulos apropriados.
- Priorize boas práticas de desenvolvimento e padrões de codificação.
- Use pnpm como gerenciador de pacotes (não npm ou yarn).

## Visão Geral do Projeto

Este é um gerador/bundler de componentes React para NocoBase que permite:

- Desenvolver componentes multi-arquivo em TypeScript/TSX
- Visualizar componentes em tempo real com hot-reload via Vite
- Fazer bundle de componentes para um único arquivo JavaScript compatível com NocoBase
- Transformar imports de bibliotecas externas para usar o contexto do NocoBase
- Organizar componentes por domínio (CRM, Atacado, etc.) com estrutura hierárquica

## Tecnologias Principais

- **React 18+** com TypeScript/TSX
- **Vite** para build e dev server com hot-reload
- **pnpm** como gerenciador de pacotes
- **Express** para API de bundling
- **NocoBase** como plataforma alvo para integração

## Estrutura de Diretórios do Projeto

output/ # Saída do bundle (gerado automaticamente)
└── [mesma estrutura de components/]

src/
├── main.tsx # Ponto de entrada da aplicação
├── app/ # Interface da aplicação
│ ├── bundle-component/ # Visualizador de bundle
│ ├── component-view/ # Visualização de componente
│ ├── files-tree/ # Navegação de componentes
│ └── context/ # Contexto da aplicação
├── bundler/ # Sistema de bundling core
│ ├── adapters/ # Adapters (NocoBase, etc)
│ ├── analyzers/ # Analisadores de código
│ ├── core/ # Lógica principal
│ ├── processors/ # Processadores
│ ├── reporters/ # Geradores de relatórios
│ ├── resolvers/ # Resolvedores de dependências
│ └── utils/ # Utilitários do bundler
├── common/ # Utilitários globais
├── config/ # Configurações
├── nocobase/ # Integração com NocoBase
│ ├── ctx.ts # Contexto do NocoBase
│ ├── hooks/ # Hooks do NocoBase
│ └── utils/ # Utilitários
└── server/ # API Express para bundling

docs/ # Documentação do projeto

````

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

### React (JSX/TSX)

- Não inclua o import React from 'react' em arquivos React 17+
- Use function components e hooks preferencialmente
- Mantenha componentes pequenos e focados
- Use PropTypes ou TypeScript para tipagem de props
- Evite state desnecessário, derive dados quando possível
- Use keys únicas em listas
- Separe lógica de apresentação e container quando fizer sentido
- Nesse projeto, utilize "export default" somente no arquivo principal do componente. Nos arquivos auxiliares, utilize "export" nomeado.

## Padrões Específicos do Projeto

### Imports e Path Aliases

- Use path aliases sempre que possível:
  - `@components/[path]` para componentes
  - `@bundler/*` para lógica de bundling
  - `@common/*` para utilitários globais
  - `@nocobase/*` para integração com NocoBase
  - `@app/*` para código da aplicação
- Evite imports relativos com `../../../`, use aliases

### Tipos e Interfaces

- Declare tipos específicos de componente em um arquivo `types.ts` ou `@types/index.ts` no diretório do componente
- Tipos compartilhados entre domínios vão em `components/@types/types.ts`
- Sempre exporte tipos para reutilização em outros componentes
- Use tipos mais específicos possível (evite `any`)

### Logging e Debug

Use o Logger customizado (`@common/Logger`) para todas as operações importantes:

```typescript
import { Logger } from "@common/Logger";

Logger.start("Iniciando processo X");
Logger.success("Operação concluída com sucesso");
Logger.error("Erro crítico", error);
Logger.info("Informação adicional");
Logger.info.verbose("Detalhes para debug (apenas com --verbose)");
````

- Use `Logger.start()` para marcar início de processamento
- Use `Logger.error()` para erros e exceções
- Use `Logger.success()` para operações concluídas
- Use `Logger.info()` para informações gerais
- Use `Logger.info.verbose()` para logs detalhados de debug

### Tratamento de Erros de Componente

- Componentes devem estar envolvidos em ErrorBoundary quando apropriado
- Use o componente `error-component.tsx` em `components/common/` para estados de erro
- Componentes devem ser robustos e nunca quebrar a aplicação

### Arquitetura do Bundler

Ao trabalhar no sistema de bundling (`src/bundler/`):

- **Adapters**: Implementam transformações específicas de contexto (ex: NocoBaseAdapter para transformar imports)
- **Analyzers**: Analisam código fonte para extrair informações (dependências, tipos, etc)
- **Processors**: Processam e transformam código
- **Resolvers**: Resolvem dependências e paths
- **Reporters**: Geram saídas estruturadas

Sempre mantenha a lógica separada entre análise, processamento e saída.

## Arquitetura do Projeto

### Estrutura de Diretórios Detalhada

Veja a seção "Estrutura de Diretórios do Projeto" para uma visão completa. Principais pontos:

- **components/**: Fonte de componentes React em TSX
  - Organizados por domínio (CRM, Atacado) ou tipo (form-inputs, utils)
  - Cada componente em seu próprio diretório em kebab-case
  - Tipos em `@types/index.ts` dentro do diretório

- **output/**: Componentes bundled automaticamente (não editar manualmente)
  - Mesma estrutura de `components/` mas com arquivos `.jsx`
  - Gerado pelo sistema de bundling

- **src/bundler/**: Sistema de bundling core
  - Responsável por analisar, processar e transformar componentes
  - Mantém lógica de análise, processamento e saída separadas

- **src/app/**: Interface web de desenvolvimento
  - Visualização em tempo real de componentes
  - Hot-reload automático via Vite
  - Navegação e controle de componentes

- **src/nocobase/**: Integração com NocoBase
  - Contexto (`ctx.ts`) e hooks customizados
  - Utilitários para adaptação de componentes
  - Mocks de funcionalidades do NocoBase

### Aliases

O projeto usa path aliases configurados em `tsconfig.json` e `vite.config.ts`:

- `@bundler/*` → `src/bundler/*`
- `@common/*` → `src/common/*`
- `@nocobase/*` → `src/nocobase/*`
- `@app/*` → `src/app/*`
- `@components/*` → `components/*`

Sempre use aliases ao invés de imports relativos.

### Logs e Debugging

O projeto usa um Logger customizado (`src/common/Logger.ts`):

```typescript
import { Logger } from "@common/Logger";

Logger.start("Iniciando processo");
Logger.success("Operação concluída");
Logger.error("Erro encontrado", error);
Logger.info("Detalhe adicional");
Logger.info.verbose("Detalhes para debug (verbose mode)");
```

Todos os métodos de Logging possuem suporte para verbose mode ativado via flag `--verbose`.
