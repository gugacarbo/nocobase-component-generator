# Arquitetura do NocoBase Component Generator

## Visão Geral

O NocoBase Component Generator é uma ferramenta modular dividida em três sistemas principais:

1. **App (Visualizador)**: Interface React para visualizar componentes
2. **Bundler**: Sistema de processamento e geração de bundles
3. **Server**: API Express para integração

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    NOCOBASE GENERATOR                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     APP      │  │   BUNDLER    │  │    SERVER    │      │
│  │ (Frontend)   │  │   (Core)     │  │   (API)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
│         │                 │                   │              │
│  ┌──────▼─────────────────▼───────────────────▼──────┐      │
│  │              COMMON UTILITIES                      │      │
│  │  Logger | PathUtils | StringUtils | Config        │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 1. Sistema App (Visualizador)

### Responsabilidades
- Renderizar interface de visualização de componentes
- Gerenciar navegação entre componentes
- Hot reload durante desenvolvimento
- Exibir árvore de arquivos

### Componentes Principais

#### AppContext
```typescript
interface AppContextType {
  components: ComponentInfo[];
  selectedComponent: string | null;
  setSelectedComponent: (component: string | null) => void;
  currentPath: string[];
  setCurrentPath: (path: string[]) => void;
  isLoading: boolean;
  error: Error | null;
}
```

**Responsabilidades:**
- Estado global da aplicação
- Gerenciamento de componentes carregados
- Controle de loading e erros

#### FilesTree
- Exibe árvore de diretórios
- Navegação por folders
- Seleção de componentes

#### ComponentView
- Renderiza componente selecionado
- Exibe estados de loading/error
- Interface de código e bundle

### Fluxo de Dados

```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  AppContext │────▶│  FilesTree   │
│             │     └──────────────┘
│  - loading  │
│  - error    │     ┌──────────────┐
│  - comps    │────▶│ComponentView │
└─────────────┘     └──────────────┘
```

## 2. Sistema Bundler

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────┐
│           SimpleBundler (Core)              │
│  - Orquestra pipeline de bundling           │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐         ┌────▼─────┐
│Loaders │         │Analyzers │
└───┬────┘         └────┬─────┘
    │                   │
┌───▼────────────────────▼─────┐
│       Processors              │
│  - Content                    │
│  - TypeScript                 │
│  - TreeShaker                 │
└───┬───────────────────────────┘
    │
┌───▼────────┐
│  Adapters  │
│  (NocoBase)│
└───┬────────┘
    │
┌───▼────────┐
│  Writers   │
└────────────┘
```

### 2.1 Core (SimpleBundler)

**Classe Principal**: `SimpleBundler`

```typescript
class SimpleBundler {
  public async bundle(): Promise<void>
  private createPipelineContext(): BundlePipelineContext
  private generateBundle(options, context): Promise<BundleResult>
  private generateBundles(fileName, context): Promise<void>
}
```

**Pipeline de Bundling:**

```
1. Carregamento
   ├─ FileLoader.loadDirectory()
   └─ FileLoader.loadSingleFile()
        │
2. Análise
   ├─ DependencyResolver.sortFilesByDependency()
   ├─ ComponentAnalyzer.findMainComponent()
   └─ ImportAnalyzer.analyzeExternalImports()
        │
3. Processamento
   ├─ ContentProcessor.concatenateFiles()
   ├─ CommentProcessor.processComments()
   ├─ TreeShaker.shake()
   └─ TypeScriptRemover.removeTypes()
        │
4. Transformação
   ├─ NocoBaseAdapter.transformImports()
   └─ NocoBaseAdapter.generateRender()
        │
5. Geração
   ├─ CodeFormatter.format()
   └─ FileWriter.saveBundle()
```

### 2.2 Analyzers

#### ComponentAnalyzer
```typescript
class ComponentAnalyzer {
  static findMainComponent(files): string | null
  static findReactComponents(content): string[]
  private static extractExportedComponent(content): string | null
}
```

**Responsabilidades:**
- Identifica componente principal (export default)
- Encontra todos os componentes React
- Analisa estrutura de componentes

#### ImportAnalyzer
```typescript
class ImportAnalyzer {
  static analyzeExternalImports(files): Map<string, Set<string>>
  static extractImports(content): ImportInfo[]
  static generateImportStatements(imports): string
  static removeUnusedImports(content, used): string
}
```

**Responsabilidades:**
- Extrai todos os imports usando AST
- Identifica imports externos vs locais
- Gera statements otimizados
- Remove imports não utilizados

#### CodeAnalyzer
```typescript
class CodeAnalyzer {
  static findUnusedDeclarations(content): Set<string>
  static analyzeDeclared(content): Set<string>
  static analyzeUsage(content): Set<string>
}
```

**Responsabilidades:**
- Identifica declarações no código
- Analisa uso de identificadores
- Suporta tree shaking

### 2.3 Processors

#### FileLoader
```typescript
class FileLoader {
  static findFiles(dir): string[]
  static loadFileInfo(filePath, srcDir): FileInfo
  static loadDirectory(srcPath): FileLoadContext
  static loadSingleFile(filePath): FileLoadContext
}
```

**Responsabilidades:**
- Carregamento recursivo de arquivos
- Extração de imports
- Validação de conteúdo

#### ContentProcessor
```typescript
class ContentProcessor {
  static cleanContent(content, fileName, removeTypes): string
  static extractDefaultProps(content): { defaultProps, contentWithout }
  static concatenateFiles(sortedFiles, fileMap, isJs): string
  static generateExport(component, isJs, defaultProps): string
}
```

**Responsabilidades:**
- Limpeza de imports e exports
- Extração de defaultProps
- Concatenação ordenada
- Geração de exports

#### TreeShaker
```typescript
class TreeShaker {
  static shake(content): string
  static removeUnusedCode(content, unused): string
}
```

**Responsabilidades:**
- Dead code elimination
- Remoção de declarações não usadas
- Otimização de bundle

#### TypeScriptRemover
```typescript
class TypeScriptRemover {
  static removeTypes(content, fileName): string
}
```

**Responsabilidades:**
- Remove anotações TypeScript
- Converte TS para JS
- Preserva lógica

### 2.4 Resolvers

#### DependencyResolver
```typescript
class DependencyResolver {
  static resolveImportPath(fromFile, importPath): string | null
  static sortFilesByDependency(files): string[]
}
```

**Responsabilidades:**
- Resolve paths de imports (aliases, relativos)
- Ordena arquivos por dependência (DFS)
- Detecta dependências circulares

**Algoritmo de Ordenação:**

```
DFS (Depth-First Search):
1. Para cada arquivo não visitado:
   a. Marca como "visitando"
   b. Visita todas as dependências recursivamente
   c. Marca como "processado"
   d. Adiciona à lista ordenada

Resultado: Dependências aparecem antes de dependentes
```

### 2.5 Adapters

#### NocoBaseAdapter
```typescript
class NocoBaseAdapter {
  static transformImports(content): string
  static processComments(content): string
  static generateRender(component, defaultProps): string
  static generateBundleHeader(): string
}
```

**Responsabilidades:**
- Transforma imports para ctx.libs
- Processa comentários especiais (//bundle-only, //no-bundle)
- Gera código específico NocoBase

**Transformação de Imports:**

```typescript
// Input
import { useState } from 'react';
import { Button } from '@nocobase/client';

// Output
const { useState } = ctx.libs.React;
const { Button } = ctx.libs.NocobaseClient;
```

### 2.6 Utils

#### LibraryMapper
```typescript
class LibraryMapper {
  static getLibraryKey(moduleName): string
  static generateAllDestructuring(libraries): string[]
}
```

**Mapeamentos:**
```typescript
{
  'react': 'React',
  '@nocobase/client': 'NocobaseClient',
  'antd': 'Antd',
  // ...
}
```

#### FileValidator
```typescript
class FileValidator {
  static shouldExcludeFile(fileName): boolean
  static shouldExcludeDir(dirPath): boolean
  static isSupportedFile(fileName): boolean
  static isMockOrTestFile(filePath): boolean
}
```

### 2.7 Reporters

#### BundleReporter
```typescript
class BundleReporter {
  static printReport(tsResult, jsResult, sortedFiles, fileMap): void
}
```

**Output Exemplo:**
```
📊 Relatório de Bundling
─────────────────────────
Arquivos processados: 5
Componente principal: MyButton
Tamanho JavaScript: 12.34 KB

Arquivos em ordem de dependência:
   1. types.ts
   2. utils.ts
   3. SubComponent.tsx
   4. MyButton.tsx
```

## 3. Sistema Server

### Estrutura

```typescript
// server/index.ts
const app = express();

app.use('/api/bundle', bundleRouter);
app.use(express.static('dist'));

// server/bundle-api.ts
router.post('/component', bundleComponent);
router.post('/all', bundleAll);
```

### Endpoints

#### POST /api/bundle/component
```json
{
  "componentPath": "components/ui/Button.tsx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bundle gerado com sucesso",
  "outputPath": "output/ui/button.js"
}
```

#### POST /api/bundle/all
**Response:**
```json
{
  "success": true,
  "bundled": 15,
  "failed": 0
}
```

## 4. Sistema Common

### Logger

```typescript
class Logger {
  static success(message, emoji?)
  static info(message, emoji?)
  static warning(message, emoji?)
  static error(message, error?, emoji?)
  static start(message, emoji?)
  static stats(label, value)
  static section(title)
  
  // Métodos verbose
  static success.verbose(message)
  static error.verbose(message, error)
}
```

**Características:**
- Logging em console com cores (chalk)
- Logging em arquivo (logs/app-YYYY-MM-DD.log)
- Modo verbose configurável
- Emojis para melhor visualização

### PathUtils

```typescript
class PathUtils {
  static join(...paths): string
  static resolve(...paths): string
  static dirname(path): string
  static getRelativePath(from, to): string
  static isRelativePath(path): boolean
  static isAlias(path): boolean
  static resolveAlias(path): string
  static isExternalModule(moduleName): boolean
}
```

### StringUtils

```typescript
class StringUtils {
  static toKebabCase(str): string
  static toPascalCase(str): string
  static toCamelCase(str): string
  static isPascalCase(str): boolean
}
```

## 5. Configuração

### Estrutura de Config

```
config/
├── config.ts           # Configuração principal (APP_CONFIG)
├── bundler-config.ts   # Configurações do bundler
├── server-config.ts    # Configurações do servidor
└── types.ts           # Tipos TypeScript
```

### APP_CONFIG

```typescript
{
  componentsPath: "components",
  outputPath: "output",
  supportedExtensions: [".tsx", ".ts", ".jsx", ".js"],
  loggerVerbose: false,
  bundler: {
    OUTPUT_EXTENSION: ".js",
    FILE_EXTENSIONS: /\.(tsx?|jsx?)$/,
    EXCLUDED_FILES: [".test.", ".spec.", ".mock."],
    EXCLUDED_DIRS: ["node_modules", ".git", "dist"],
    LIBRARY_MAPPINGS: { /* ... */ }
  }
}
```

## 6. Fluxos Principais

### Fluxo de Desenvolvimento

```
1. User inicia pnpm dev
   ↓
2. Vite inicia servidor de desenvolvimento
   ↓
3. App carrega componentes de components/
   ↓
4. User seleciona componente no FilesTree
   ↓
5. ComponentView renderiza componente
   ↓
6. Hot reload ao detectar mudanças
```

### Fluxo de Bundling

```
1. User executa pnpm bundle <path>
   ↓
2. SimpleBundler carrega arquivo/diretório
   ↓
3. FileLoader encontra todos os arquivos
   ↓
4. DependencyResolver ordena por dependência
   ↓
5. ComponentAnalyzer encontra componente principal
   ↓
6. ImportAnalyzer extrai imports externos
   ↓
7. ContentProcessor concatena e limpa código
   ↓
8. TreeShaker remove código não usado
   ↓
9. NocoBaseAdapter transforma para NocoBase
   ↓
10. FileWriter salva bundle em output/
    ↓
11. BundleReporter exibe relatório
```

## 7. Padrões de Projeto

### Factory Pattern
- Criação de sourceFile TypeScript
- Geração de contextos

### Strategy Pattern
- Diferentes estratégias de processamento (TS vs JS)
- Adaptadores específicos (NocoBase)

### Pipeline Pattern
- Processamento sequencial no bundler
- Cada etapa recebe saída da anterior

### Observer Pattern
- Hot reload no modo desenvolvimento
- Vite HMR

## 8. Otimizações

### Performance
- Análise AST única por arquivo
- Processamento paralelo quando possível
- Regex compilado e reutilizado

### Memória
- Streaming de arquivos grandes
- Cleanup de contextos temporários

### Bundle Size
- Tree shaking agressivo
- Remoção de comentários
- Minimização de whitespace

## 9. Tratamento de Erros

### Estratégia
1. **Validação Antecipada**: Valida inputs no construtor
2. **Try-Catch Granular**: Cada etapa tem tratamento
3. **Logging Detalhado**: Erros logados com contexto
4. **Fallbacks**: Retorna código original se transformação falha
5. **Propagação Controlada**: Erros críticos são propagados

### Exemplos

```typescript
// Validação no construtor
if (!srcPath || srcPath.trim() === "") {
  throw new Error("srcPath não pode ser vazio");
}

// Try-catch em processamento
try {
  codeContent = TreeShaker.shake(codeContent);
} catch (error) {
  Logger.error.verbose("Erro durante tree shaking", error);
  Logger.warning("Retornando código original");
  return content;
}
```

## 10. Extensibilidade

### Adicionar Novo Analyzer
```typescript
export class CustomAnalyzer {
  static analyze(content: string): AnalysisResult {
    // Implementação
  }
}

// Em SimpleBundler
const customAnalysis = CustomAnalyzer.analyze(fileContents);
```

### Adicionar Novo Processor
```typescript
export class CustomProcessor {
  static process(content: string): string {
    // Implementação
  }
}

// No pipeline
codeContent = CustomProcessor.process(codeContent);
```

### Adicionar Novo Adapter
```typescript
export class AnotherPlatformAdapter {
  static transform(content: string): string {
    // Implementação para outra plataforma
  }
}
```

## 11. Testing (Futuro)

### Estrutura Sugerida
```
tests/
├── unit/
│   ├── analyzers/
│   ├── processors/
│   └── utils/
├── integration/
│   └── bundler/
└── e2e/
    └── full-pipeline/
```

## 12. Considerações de Segurança

- **Path Traversal**: Validação de paths
- **Code Injection**: Sanitização de inputs
- **File Access**: Permissões controladas
- **Memory Limits**: Prevenção de DoS

## 13. Monitoramento

### Logs
- `logs/app-YYYY-MM-DD.log`: Logs diários
- Verbose mode para debugging
- Métricas de performance

### Métricas
- Tempo de bundling
- Tamanho de bundles
- Taxa de sucesso/falha
- Componentes processados
