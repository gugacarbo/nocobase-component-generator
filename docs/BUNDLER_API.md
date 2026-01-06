# API do Bundler

Documentação completa da API do sistema de bundling.

## SimpleBundler

Classe principal que orquestra todo o processo de bundling.

### Construtor

```typescript
constructor(
  srcPath: string,
  outputDir: string,
  options?: Partial<BundlerConfig>
)
```

**Parâmetros:**
- `srcPath`: Caminho do arquivo ou diretório fonte
- `outputDir`: Diretório de saída para bundles
- `options`: Configurações opcionais do bundler

**Validações:**
- srcPath não pode ser vazio
- outputDir não pode ser vazio
- srcPath deve existir no filesystem

**Exemplo:**
```typescript
const bundler = new SimpleBundler(
  'components/ui/Button.tsx',
  'output',
  { exportTypescript: true }
);
```

### Métodos Públicos

#### bundle()

```typescript
public async bundle(): Promise<void>
```

Executa o processo completo de bundling.

**Pipeline:**
1. Carrega arquivos
2. Cria contexto de pipeline
3. Gera bundles TypeScript e JavaScript
4. Salva no disco
5. Exibe relatório

**Throws:**
- `Error`: Se nenhum arquivo for encontrado
- `Error`: Se bundle gerado estiver vazio
- `Error`: Em caso de falha crítica

**Exemplo:**
```typescript
try {
  await bundler.bundle();
  console.log('Bundle gerado com sucesso!');
} catch (error) {
  console.error('Falha no bundling:', error);
}
```

## Analyzers

### ComponentAnalyzer

Analisa componentes React no código.

#### findMainComponent()

```typescript
static findMainComponent(files: Map<string, string>): string | null
```

Encontra o componente principal (último com export default).

**Parâmetros:**
- `files`: Mapa de conteúdos de arquivos

**Retorna:**
- Nome do componente ou `null` se não encontrado

**Estratégia:**
1. Procura por `export default ComponentName`
2. Procura por `export default function ComponentName`
3. Procura por qualquer componente React

**Exemplo:**
```typescript
const files = new Map([
  ['Button.tsx', 'export default function Button() {}']
]);
const mainComponent = ComponentAnalyzer.findMainComponent(files);
// Retorna: "Button"
```

#### findReactComponents()

```typescript
static findReactComponents(content: string): string[]
```

Encontra todos os componentes React no código.

**Parâmetros:**
- `content`: Código fonte

**Retorna:**
- Array de nomes de componentes

**Detecta:**
- Function components
- Arrow function components
- Class components

**Exemplo:**
```typescript
const content = `
  function Button() {}
  const Icon = () => {};
  class Modal extends React.Component {}
`;
const components = ComponentAnalyzer.findReactComponents(content);
// Retorna: ["Button", "Icon", "Modal"]
```

### ImportAnalyzer

Analisa e transforma imports no código.

#### extractImports()

```typescript
static extractImports(content: string): ImportInfo[]
```

Extrai todos os imports usando análise AST.

**Parâmetros:**
- `content`: Código fonte

**Retorna:**
- Array de `ImportInfo`

**ImportInfo Interface:**
```typescript
interface ImportInfo {
  moduleName: string;
  importedNames: string[];
  isExternal: boolean;
  isDefault: boolean;
  hasNamedImports: boolean;
}
```

**Exemplo:**
```typescript
const content = `
  import React, { useState } from 'react';
  import { Button } from '@nocobase/client';
`;
const imports = ImportAnalyzer.extractImports(content);
// Retorna:
// [
//   {
//     moduleName: 'react',
//     importedNames: ['React', 'useState'],
//     isExternal: true,
//     isDefault: true,
//     hasNamedImports: true
//   },
//   { ... }
// ]
```

#### analyzeExternalImports()

```typescript
static analyzeExternalImports(
  files: Map<string, string>
): Map<string, Set<string>>
```

Analisa todos os arquivos e agrupa imports externos.

**Parâmetros:**
- `files`: Mapa de conteúdos

**Retorna:**
- Map: módulo → Set de nomes importados

**Exemplo:**
```typescript
const files = new Map([
  ['file1.tsx', "import { useState } from 'react';"],
  ['file2.tsx', "import { useEffect } from 'react';"]
]);
const imports = ImportAnalyzer.analyzeExternalImports(files);
// Retorna: Map { 'react' => Set { 'useState', 'useEffect' } }
```

#### generateImportStatements()

```typescript
static generateImportStatements(
  imports: Map<string, Set<string>>
): string
```

Gera declarações de import formatadas.

**Parâmetros:**
- `imports`: Map de módulo → nomes

**Retorna:**
- String com imports formatados

**Exemplo:**
```typescript
const imports = new Map([
  ['react', new Set(['useState', 'useEffect'])],
  ['antd', new Set(['Button'])]
]);
const statements = ImportAnalyzer.generateImportStatements(imports);
// Retorna:
// import { useState, useEffect } from 'react'
// import { Button } from 'antd'
```

#### removeUnusedImports()

```typescript
static removeUnusedImports(
  content: string,
  usedIdentifiers: Set<string>
): string
```

Remove imports não utilizados do código.

**Parâmetros:**
- `content`: Código fonte
- `usedIdentifiers`: Set de identificadores usados

**Retorna:**
- Código com imports otimizados

**Exemplo:**
```typescript
const content = `
  import { useState, useEffect, useMemo } from 'react';
  function Component() {
    const [state, setState] = useState(0);
    return <div>{state}</div>;
  }
`;
const used = new Set(['useState']);
const cleaned = ImportAnalyzer.removeUnusedImports(content, used);
// Retorna: import { useState } from 'react';
```

### CodeAnalyzer

Analisa declarações e uso de identificadores.

#### findUnusedDeclarations()

```typescript
static findUnusedDeclarations(content: string): Set<string>
```

Identifica declarações não utilizadas.

**Parâmetros:**
- `content`: Código fonte

**Retorna:**
- Set de nomes não utilizados

**Detecta:**
- Funções não usadas
- Variáveis não usadas
- Constantes não usadas
- **Exclui:** Componentes React (PascalCase)

**Exemplo:**
```typescript
const content = `
  const usedVar = 1;
  const unusedVar = 2;
  console.log(usedVar);
`;
const unused = CodeAnalyzer.findUnusedDeclarations(content);
// Retorna: Set { 'unusedVar' }
```

#### analyzeDeclared()

```typescript
static analyzeDeclared(content: string): Set<string>
```

Identifica todas as declarações.

**Detecta:**
- Funções
- Variáveis (const, let, var)
- Classes
- Interfaces
- Type aliases
- Enums

#### analyzeUsage()

```typescript
static analyzeUsage(content: string): Set<string>
```

Identifica todos os identificadores usados.

**Exclui:**
- Identificadores em posição de declaração
- Imports (processados separadamente)

## Processors

### FileLoader

Carrega e processa arquivos do filesystem.

#### findFiles()

```typescript
static findFiles(dir: string, fileList?: string[]): string[]
```

Encontra recursivamente todos os arquivos suportados.

**Parâmetros:**
- `dir`: Diretório raiz
- `fileList`: Array acumulador (uso interno)

**Retorna:**
- Array de caminhos de arquivos

**Comportamento:**
- Recursivo
- Respeita exclusões configuradas
- Filtra por extensões suportadas

**Exemplo:**
```typescript
const files = FileLoader.findFiles('components/ui');
// Retorna: ['components/ui/Button.tsx', 'components/ui/Icon.tsx', ...]
```

#### loadFileInfo()

```typescript
static loadFileInfo(filePath: string, srcDir: string): FileInfo
```

Carrega informações detalhadas de um arquivo.

**Parâmetros:**
- `filePath`: Caminho do arquivo
- `srcDir`: Diretório fonte base

**Retorna:**
```typescript
interface FileInfo {
  path: string;
  content: string;
  imports: string[];
  relativePath: string;
}
```

**Validações:**
- Loga aviso se arquivo estiver vazio
- Throw se erro de leitura

#### loadDirectory()

```typescript
static loadDirectory(srcPath: string): FileLoadContext
```

Carrega todos os arquivos de um diretório.

**Retorna:**
```typescript
interface FileLoadContext {
  files: Map<string, FileInfo>;
  firstFileRelativePath: string;
}
```

#### loadSingleFile()

```typescript
static loadSingleFile(filePath: string): FileLoadContext
```

Carrega um arquivo único e suas dependências recursivamente.

**Comportamento:**
- Resolve imports locais
- Carrega dependências automaticamente
- Previne carregamento duplicado

### ContentProcessor

Processa e limpa conteúdo de arquivos.

#### cleanContent()

```typescript
static cleanContent(
  content: string,
  fileName: string,
  removeTypes?: boolean
): string
```

Remove imports, exports e opcionalmente tipos.

**Parâmetros:**
- `content`: Código fonte
- `fileName`: Nome do arquivo (para contexto)
- `removeTypes`: Se deve remover TypeScript (default: false)

**Remove:**
- Todos os imports
- Todos os exports
- Tipos TypeScript (se removeTypes=true)
- Linhas vazias excessivas

#### extractDefaultProps()

```typescript
static extractDefaultProps(content: string): {
  defaultProps: string;
  contentWithout: string;
}
```

Extrai declaração de defaultProps.

**Retorna:**
- `defaultProps`: Declaração extraída
- `contentWithout`: Código sem defaultProps

**Padrão detectado:**
```typescript
const defaultProps = {
  // ...
};
```

#### concatenateFiles()

```typescript
static concatenateFiles(
  sortedFiles: string[],
  fileInfoMap: Map<string, FileInfo>,
  isJavascript: boolean
): string
```

Concatena múltiplos arquivos ordenados.

**Parâmetros:**
- `sortedFiles`: Array de paths ordenados por dependência
- `fileInfoMap`: Map de FileInfo
- `isJavascript`: Se deve remover tipos

**Retorna:**
- String com código concatenado

**Comportamento:**
- Ignora arquivos de teste/mock
- Remove imports/exports de cada arquivo
- Separa arquivos com linha vazia

#### generateExport()

```typescript
static generateExport(
  component: string,
  isJavaScript: boolean,
  defaultProps?: string | null
): string
```

Gera export apropriado para o bundle.

**TypeScript:**
```typescript
export { ComponentName };
```

**JavaScript:**
```typescript
ctx.render(<ComponentName {...defaultProps} />);
```

### TreeShaker

Remove código não utilizado (dead code elimination).

#### shake()

```typescript
static shake(content: string): string
```

Remove declarações não utilizadas.

**Processo:**
1. Encontra declarações não usadas
2. Remove código não utilizado
3. Remove imports não utilizados

**Tratamento de Erro:**
- Em caso de falha, retorna código original
- Loga erro detalhado em verbose mode

**Exemplo:**
```typescript
const content = `
  function unusedFn() {}
  function usedFn() { return 1; }
  const result = usedFn();
`;
const shaken = TreeShaker.shake(content);
// Remove: unusedFn
// Mantém: usedFn, result
```

#### removeUnusedCode()

```typescript
static removeUnusedCode(
  content: string,
  unused: Set<string>
): string
```

Remove nós AST específicos.

**Remove:**
- Function declarations
- Variable statements
- Class declarations

### TypeScriptRemover

Remove anotações TypeScript para gerar JavaScript.

#### removeTypes()

```typescript
static removeTypes(content: string, fileName: string): string
```

Converte TypeScript para JavaScript.

**Remove:**
- Type annotations
- Interfaces
- Type aliases
- Enums
- Generics

**Preserva:**
- Lógica de execução
- Estrutura do código
- Comentários

### CodeFormatter

Formata código usando Prettier.

#### format()

```typescript
static async format(
  content: string,
  isTypeScript: boolean
): Promise<string>
```

Formata código com Prettier.

**Configuração:**
```typescript
{
  parser: isTypeScript ? 'typescript' : 'babel',
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: true
}
```

**Fallback:**
- Se Prettier falhar, retorna código original
- Loga erro em verbose mode

### FileWriter

Escreve bundles no disco.

#### writeFile()

```typescript
static writeFile(filePath: string, content: string): boolean
```

Escreve arquivo com tratamento de erros.

**Validações:**
- Não escreve conteúdo vazio
- Cria diretórios necessários

**Retorna:**
- `true`: Sucesso
- `false`: Falha

#### saveBundle()

```typescript
static async saveBundle(
  result: BundleResult,
  fileName: string,
  outputDir: string,
  firstFileRelativePath: string
): Promise<void>
```

Salva bundle formatado no disco.

**Processo:**
1. Calcula output path
2. Formata código
3. Cria diretórios
4. Escreve arquivo
5. Loga sucesso

## Resolvers

### DependencyResolver

Resolve dependências entre arquivos.

#### resolveImportPath()

```typescript
static resolveImportPath(
  fromFile: string,
  importPath: string
): string | null
```

Resolve caminho real de um import.

**Suporta:**
- Aliases (`@common/Logger`)
- Paths relativos (`./utils`)
- Diretórios (busca index.*)
- Múltiplas extensões

**Retorna:**
- Caminho absoluto ou `null` se não encontrado

**Exemplo:**
```typescript
const resolved = DependencyResolver.resolveImportPath(
  '/path/Button.tsx',
  './utils'
);
// Pode retornar: '/path/utils.ts' ou '/path/utils/index.ts'
```

#### sortFilesByDependency()

```typescript
static sortFilesByDependency(
  files: Map<string, FileInfo>
): string[]
```

Ordena arquivos por dependência usando DFS.

**Algoritmo:**
1. Depth-First Search recursivo
2. Dependências visitadas primeiro
3. Detecta e loga dependências circulares

**Retorna:**
- Array ordenado: dependências → dependentes

**Exemplo:**
```typescript
// types.ts não importa nada
// utils.ts importa types.ts
// Button.tsx importa utils.ts

const sorted = DependencyResolver.sortFilesByDependency(files);
// Retorna: ['types.ts', 'utils.ts', 'Button.tsx']
```

## Adapters

### NocoBaseAdapter

Transforma código para compatibilidade NocoBase.

#### transformImports()

```typescript
static transformImports(content: string): string
```

Transforma imports para usar ctx.libs.

**Transformação:**
```typescript
// Antes
import { useState } from 'react';
import { Button } from '@nocobase/client';

// Depois
const { useState } = ctx.libs.React;
const { Button } = ctx.libs.NocobaseClient;
```

#### processComments()

```typescript
static processComments(content: string): string
```

Processa comentários especiais.

**Comentários:**
- `//bundle-only`: Mantém apenas no bundle
- `//no-bundle`: Remove do bundle

**Exemplo:**
```typescript
const content = `
// //bundle-only
const prodCode = 1;

// //no-bundle
const devCode = 2;
`;
const processed = NocoBaseAdapter.processComments(content);
// Mantém: prodCode
// Remove: devCode
```

#### generateRender()

```typescript
static generateRender(
  componentName: string,
  defaultProps?: string | null
): string
```

Gera código de renderização NocoBase.

**Output:**
```javascript
ctx.render(<ComponentName {...defaultProps} />);

// === === Components === ===
```

#### generateBundleHeader()

```typescript
static generateBundleHeader(): string
```

Gera cabeçalho do bundle.

**Output:**
```javascript
// Componente gerado pelo NocoBase Component Generator
// Data: 06/01/2026, 15:30:00
```

## Utils

### LibraryMapper

Mapeia bibliotecas para chaves do NocoBase.

#### getLibraryKey()

```typescript
static getLibraryKey(moduleName: string): string
```

Obtém chave para ctx.libs.

**Mapeamentos:**
```typescript
'react' → 'React'
'@nocobase/client' → 'NocobaseClient'
'antd' → 'Antd'
'react-router-dom' → 'ReactRouterDom'
```

**Conversão automática:**
- Remove escopo: `@mui/material` → `material`
- Converte para PascalCase: `my-lib` → `MyLib`

#### generateAllDestructuring()

```typescript
static generateAllDestructuring(
  libraries: Map<string, Set<string>>
): string[]
```

Gera múltiplas linhas de destructuring.

**Exemplo:**
```typescript
const libs = new Map([
  ['react', new Set(['useState', 'useEffect'])],
  ['antd', new Set(['Button'])]
]);
const lines = LibraryMapper.generateAllDestructuring(libs);
// Retorna:
// [
//   'const { useState, useEffect } = ctx.libs.React;',
//   'const { Button } = ctx.libs.Antd;'
// ]
```

### FileValidator

Valida arquivos e diretórios.

#### shouldExcludeFile()

```typescript
static shouldExcludeFile(fileName: string): boolean
```

Verifica se arquivo deve ser excluído.

**Exclusões:**
- `.test.`
- `.spec.`
- `.mock.`

#### shouldExcludeDir()

```typescript
static shouldExcludeDir(dirPath: string): boolean
```

Verifica se diretório deve ser excluído.

**Exclusões:**
- `node_modules`
- `.git`
- `dist`
- `build`

#### isSupportedFile()

```typescript
static isSupportedFile(fileName: string): boolean
```

Verifica se extensão é suportada.

**Suportadas:**
- `.tsx`
- `.ts`
- `.jsx`
- `.js`

#### isMockOrTestFile()

```typescript
static isMockOrTestFile(filePath: string): boolean
```

Verifica se é arquivo de mock ou teste.

**Padrões:**
- `*.test.*`
- `*.spec.*`
- `*.mock.*`
- `ctx.mock.ts`

## Reporters

### BundleReporter

Gera relatórios de bundling.

#### printReport()

```typescript
static printReport(
  tsResult: BundleResult | undefined,
  jsResult: BundleResult,
  sortedFiles: string[],
  fileInfoMap: Map<string, { relativePath: string }>
): void
```

Imprime relatório detalhado (apenas em verbose mode).

**Relatório inclui:**
- Arquivos processados
- Componente principal
- Tamanhos de bundles
- Lista ordenada de arquivos

**Exemplo de output:**
```
─────────────────────────
📊 Relatório de Bundling
─────────────────────────
Arquivos processados: 5
Componente principal: Button
Tamanho TypeScript: 8.45 KB
Tamanho JavaScript: 6.23 KB

Arquivos em ordem de dependência:
   1. types.ts
   2. utils.ts
   3. components/Icon.tsx
   4. Button.tsx
```

## Types

### Interfaces Principais

```typescript
interface FileInfo {
  path: string;
  content: string;
  imports: string[];
  relativePath: string;
}

interface BundleOptions {
  isJavascript: boolean;
  outputFileName: string;
}

interface BundlePipelineContext {
  sortedFiles: string[];
  fileContents: Map<string, string>;
  files: Map<string, FileInfo>;
  mainComponent: string | null;
  externalImports: Map<string, Set<string>>;
}

interface BundleResult {
  content: string;
  fileCount: number;
  sizeKB: number;
  files: string[];
  mainComponent?: string;
}

interface FileLoadContext {
  files: Map<string, FileInfo>;
  firstFileRelativePath: string;
}

interface ImportInfo {
  moduleName: string;
  importedNames: string[];
  isExternal: boolean;
  isDefault: boolean;
  hasNamedImports: boolean;
}
```

## Uso Avançado

### Exemplo Completo

```typescript
import { SimpleBundler } from './bundler';

async function bundleComponent() {
  // Criar bundler com opções customizadas
  const bundler = new SimpleBundler(
    'components/CRM/demandas/campos-personalizados',
    'output',
    {
      exportTypescript: true,  // Gera .tsx além de .js
      OUTPUT_EXTENSION: '.js'
    }
  );

  try {
    // Executar bundling
    await bundler.bundle();
    
    console.log('Bundle gerado com sucesso!');
    // Output em: output/CRM/demandas/campos-personalizados.js
    // Output em: output/CRM/demandas/campos-personalizados.tsx
  } catch (error) {
    console.error('Erro no bundling:', error);
    // Erro já foi logado pelo sistema
  }
}

bundleComponent();
```

### Bundle Programático

```typescript
import { 
  FileLoader, 
  DependencyResolver,
  ComponentAnalyzer,
  ContentProcessor 
} from './bundler';

// Carregar arquivos manualmente
const { files } = FileLoader.loadDirectory('components/ui');

// Ordenar por dependência
const sorted = DependencyResolver.sortFilesByDependency(files);

// Encontrar componente principal
const contents = ContentProcessor.getFileContents(files, sorted);
const mainComponent = ComponentAnalyzer.findMainComponent(contents);

// Processar conteúdo
let code = ContentProcessor.concatenateFiles(sorted, files, true);
code = ContentProcessor.cleanContent(code, 'bundle.js', true);

console.log('Componente:', mainComponent);
console.log('Código:', code);
```

### Customização de Mapeamentos

```typescript
// bundler-config.ts
export const BUNDLER_CONFIG = {
  LIBRARY_MAPPINGS: {
    'react': 'React',
    '@nocobase/client': 'NocobaseClient',
    'custom-lib': 'CustomLibKey',  // Adicione seu mapeamento
  }
};
```

### Validação Customizada

```typescript
import { FileValidator } from './bundler';

// Estender validações
class CustomValidator extends FileValidator {
  static shouldExcludeFile(fileName: string): boolean {
    // Lógica customizada
    if (fileName.includes('.private.')) {
      return true;
    }
    return super.shouldExcludeFile(fileName);
  }
}
```
