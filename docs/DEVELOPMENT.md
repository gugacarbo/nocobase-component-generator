# Guia de Desenvolvimento

Guia completo para desenvolver e contribuir com o NocoBase Component Generator.

## Setup do Ambiente

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd nocobase-component-generator
pnpm install
```

### 2. Configuração do Editor

#### VS Code (Recomendado)

Extensões recomendadas:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Path Intellisense

**settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### 3. Estrutura de Branches

```
main              # Produção estável
├── develop       # Desenvolvimento ativo
├── feature/*     # Novas funcionalidades
├── fix/*         # Correções de bugs
└── docs/*        # Melhorias de documentação
```

## Desenvolvimento

### Modo Desenvolvimento

```bash
# Inicia servidor com hot reload
pnpm dev

# Servidor inicia em http://localhost:5173
```

### Estrutura de Desenvolvimento

```
src/
├── app/              # Frontend React
│   ├── App.tsx       # Componente raiz
│   ├── context/      # Context API
│   ├── component-view/
│   └── files-tree/
├── bundler/          # Core do bundler
│   ├── core/         # Classes principais
│   ├── analyzers/    # Análise de código
│   ├── processors/   # Processamento
│   └── adapters/     # Adaptadores
├── common/           # Código compartilhado
│   ├── Logger.ts
│   └── utils/
└── config/           # Configurações
```

### Path Aliases

Configurados em `tsconfig.json` e `vite.config.ts`:

```typescript
{
  "@bundler/*": "src/bundler/*",
  "@common/*": "src/common/*",
  "@nocobase/*": "src/nocobase/*",
  "@app/*": "src/app/*",
  "@components/*": "components/*"
}
```

**Uso:**
```typescript
// ✅ Correto
import { Logger } from "@common/Logger";
import { SimpleBundler } from "@bundler/core/SimpleBundler";

// ❌ Evite
import { Logger } from "../../common/Logger";
```

## Padrões de Código

### TypeScript

#### Tipos Explícitos

```typescript
// ✅ Bom
function processFile(path: string): FileInfo {
  // ...
}

// ❌ Evite
function processFile(path) {
  // ...
}
```

#### Interfaces vs Types

```typescript
// Use interface para objetos
interface FileInfo {
  path: string;
  content: string;
}

// Use type para unions, intersections
type Status = "loading" | "success" | "error";
type Result = FileInfo & { status: Status };
```

#### Null Safety

```typescript
// ✅ Bom
const component = ComponentAnalyzer.findMainComponent(files);
if (component) {
  console.log(component);
}

// ❌ Evite
const component = ComponentAnalyzer.findMainComponent(files)!;
console.log(component);
```

### React

#### Componentes Funcionais

```typescript
// ✅ Bom
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Evite
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

#### Hooks

```typescript
// ✅ Bom - Custom hooks
function useComponentLoader() {
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // ...
  }, []);
  
  return { components, loading };
}

// ✅ Uso
const { components, loading } = useComponentLoader();
```

### Logging

#### Uso do Logger

```typescript
import { Logger } from "@common/Logger";

// ✅ Bom
Logger.start("Iniciando processo");
Logger.success("Operação concluída");
Logger.error("Erro encontrado", error);
Logger.info.verbose("Detalhe adicional");

// ❌ Evite
console.log("Iniciando processo");
console.error(error);
```

#### Quando Usar Verbose

```typescript
// Logs sempre visíveis
Logger.info("Processando bundle");
Logger.success("Bundle gerado");

// Logs apenas em modo verbose
Logger.info.verbose("Arquivo carregado: file.tsx");
Logger.success.verbose(`${count} arquivos processados`);
```

### Tratamento de Erros

#### Try-Catch Apropriado

```typescript
// ✅ Bom
public async bundle(): Promise<void> {
  try {
    await this.loadFiles();
    await this.process();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    Logger.error("Erro durante bundling", err);
    throw err;
  }
}
```

#### Validação Antecipada

```typescript
// ✅ Bom
constructor(srcPath: string) {
  if (!srcPath || srcPath.trim() === "") {
    throw new Error("srcPath não pode ser vazio");
  }
  
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Path não encontrado: ${srcPath}`);
  }
  
  this.srcPath = srcPath;
}
```

#### Fallbacks

```typescript
// ✅ Bom - Fallback gracioso
public static shake(content: string): string {
  try {
    return this.performTreeShaking(content);
  } catch (error) {
    Logger.error.verbose("Erro durante tree shaking", error);
    Logger.warning("Retornando código original");
    return content;
  }
}
```

## Adicionando Funcionalidades

### 1. Novo Analyzer

```typescript
// src/bundler/analyzers/CustomAnalyzer.ts
export class CustomAnalyzer {
  /**
   * Analisa aspecto customizado do código
   */
  public static analyze(content: string): CustomResult {
    // Implementação
    return result;
  }
}

// Exportar em src/bundler/index.ts
export * from "./analyzers/CustomAnalyzer";

// Usar em SimpleBundler
const customResult = CustomAnalyzer.analyze(content);
```

### 2. Novo Processor

```typescript
// src/bundler/processors/CustomProcessor.ts
export class CustomProcessor {
  /**
   * Processa código de forma customizada
   */
  public static process(content: string): string {
    // Implementação
    return processedContent;
  }
}

// Adicionar ao pipeline em SimpleBundler
codeContent = CustomProcessor.process(codeContent);
```

### 3. Novo Adapter

```typescript
// src/bundler/adapters/CustomPlatformAdapter.ts
export class CustomPlatformAdapter {
  /**
   * Transforma código para plataforma customizada
   */
  public static transform(content: string): string {
    // Implementação
    return transformed;
  }
  
  public static generateHeader(): string {
    return "// Custom Platform Bundle\n\n";
  }
}
```

### 4. Novo Componente React

```typescript
// src/app/my-feature/MyComponent.tsx
import { useAppContext } from "../context/app-context/use-app-context";

interface MyComponentProps {
  // Props
}

export function MyComponent({ }: MyComponentProps) {
  const { components } = useAppContext();
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// src/app/my-feature/index.ts
export { MyComponent } from "./MyComponent";
```

## Testing (Futuro)

### Estrutura de Testes

```typescript
// tests/unit/analyzers/ComponentAnalyzer.test.ts
import { describe, it, expect } from 'vitest';
import { ComponentAnalyzer } from '@bundler/analyzers/ComponentAnalyzer';

describe('ComponentAnalyzer', () => {
  describe('findMainComponent', () => {
    it('deve encontrar componente com export default', () => {
      const files = new Map([
        ['Button.tsx', 'export default function Button() {}']
      ]);
      
      const result = ComponentAnalyzer.findMainComponent(files);
      
      expect(result).toBe('Button');
    });
    
    it('deve retornar null quando nenhum componente é encontrado', () => {
      const files = new Map([
        ['utils.ts', 'export const helper = () => {}']
      ]);
      
      const result = ComponentAnalyzer.findMainComponent(files);
      
      expect(result).toBeNull();
    });
  });
});
```

### Executar Testes

```bash
# Todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Com coverage
pnpm test:coverage
```

## Debugging

### VS Code Launch Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Bundler",
      "program": "${workspaceFolder}/src/bundler/core/SimpleBundler.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Debugging com Breakpoints

```typescript
// Adicione breakpoints no código
export class SimpleBundler {
  public async bundle(): Promise<void> {
    debugger; // Breakpoint programático
    
    await this.loadFiles();
    // ...
  }
}
```

### Modo Verbose

```bash
# Ativa logs detalhados
LOG_VERBOSE=true pnpm dev
LOG_VERBOSE=true pnpm bundle components/ui/Button.tsx
```

### Logs em Arquivo

Logs são salvos automaticamente em:
```
logs/app-2026-01-06.log
```

**Formato:**
```
[2026-01-06T15:30:00.000Z] [INFO] Iniciando processo de bundling
[2026-01-06T15:30:01.234Z] [ERROR] Erro ao carregar arquivo
  Stack: Error: ENOENT: no such file or directory
    at ...
```

## Performance

### Profiling

```typescript
// Medir tempo de execução
const startTime = performance.now();

await bundler.bundle();

const endTime = performance.now();
Logger.info(`Tempo: ${(endTime - startTime).toFixed(2)}ms`);
```

### Otimizações

#### 1. Evite Criar AST Repetidamente

```typescript
// ❌ Ruim
lines.forEach(line => {
  const sourceFile = ts.createSourceFile(..., line, ...);
  // Processar
});

// ✅ Bom
const sourceFile = ts.createSourceFile(..., content, ...);
// Processar uma vez
```

#### 2. Use Maps para Lookups

```typescript
// ❌ Ruim
const file = files.find(f => f.path === targetPath);

// ✅ Bom
const fileMap = new Map(files.map(f => [f.path, f]));
const file = fileMap.get(targetPath);
```

#### 3. Memoize Computações Caras

```typescript
// Cache de regex
let cachedPattern: RegExp | null = null;

function getPattern(): RegExp {
  if (!cachedPattern) {
    cachedPattern = new RegExp(...);
  }
  return cachedPattern;
}
```

## Build e Deploy

### Build para Produção

```bash
# Build completo
pnpm build

# Output em dist/
```

### Estrutura de Build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

### Deploy

```bash
# Build
pnpm build

# Deploy (exemplo com serviço estático)
npx serve dist -p 3000
```

## CI/CD (Futuro)

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

## Convenções

### Commits

Siga Conventional Commits:

```bash
# Features
git commit -m "feat: adiciona suporte para JSX"
git commit -m "feat(bundler): implementa cache de AST"

# Fixes
git commit -m "fix: corrige importação circular"
git commit -m "fix(analyzer): resolve bug em componentes anônimos"

# Docs
git commit -m "docs: atualiza README"
git commit -m "docs(api): adiciona exemplos de uso"

# Refactor
git commit -m "refactor: simplifica lógica de ordenação"

# Performance
git commit -m "perf: otimiza análise de imports"

# Tests
git commit -m "test: adiciona testes para ComponentAnalyzer"
```

### Nomes de Arquivos

```
PascalCase:    ComponentAnalyzer.ts, SimpleBundler.ts
camelCase:     pathUtils.ts, stringUtils.ts
kebab-case:    bundle-api.ts, app-context.tsx
```

### Nomes de Variáveis

```typescript
// PascalCase: Classes, Interfaces, Types
class SimpleBundler {}
interface FileInfo {}
type Status = "loading";

// camelCase: Variáveis, funções, métodos
const filePath = "...";
function processFile() {}

// UPPER_SNAKE_CASE: Constantes
const MAX_FILE_SIZE = 1024 * 1024;
const DEFAULT_OUTPUT_DIR = "output";
```

## Resolução de Problemas

### Erro: "Module not found"

```bash
# Limpe cache do TypeScript
rm -rf node_modules/.vite

# Reinstale dependências
pnpm install
```

### Erro: "Cannot find type"

```bash
# Verifique tsconfig.json
# Certifique-se de que paths estão configurados
```

### Hot Reload não Funciona

```bash
# Reinicie o servidor
# Verifique se o arquivo está em src/
```

### Bundle Vazio

```typescript
// Desabilite tree shaking temporariamente
const BUNDLER_CONFIG = {
  // ...
  disableTreeShaking: true
};
```

## Recursos Úteis

### Documentação Externa

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

### Ferramentas

- [AST Explorer](https://astexplorer.net/) - Visualize AST TypeScript
- [TypeScript Playground](https://www.typescriptlang.org/play) - Teste código TypeScript
- [Regex101](https://regex101.com/) - Teste expressões regulares

## Contribuindo

### Pull Request Checklist

- [ ] Código segue padrões do projeto
- [ ] Testes adicionados (quando aplicável)
- [ ] Documentação atualizada
- [ ] Commits seguem convenção
- [ ] Build passa sem erros
- [ ] Código revisado por pelo menos 1 pessoa

### Code Review

Ao revisar PRs, verifique:
- Lógica está correta
- Tratamento de erros apropriado
- Performance não degradou
- Documentação adequada
- Testes cobrem casos importantes

## Roadmap

### Curto Prazo
- [ ] Adicionar testes unitários
- [ ] Melhorar error handling
- [ ] Otimizar performance

### Médio Prazo
- [ ] Adicionar cache de bundles
- [ ] Suporte para múltiplas plataformas
- [ ] Interface CLI melhorada

### Longo Prazo
- [ ] Plugin system
- [ ] Watch mode para bundling
- [ ] Integração com IDEs

## Suporte

### Onde Buscar Ajuda

1. **Documentação**: Leia docs/ primeiro
2. **Issues**: Busque em issues existentes
3. **Discussões**: Use GitHub Discussions
4. **Community**: Canal de Slack/Discord

### Reportar Bugs

```markdown
## Descrição
[Descrição clara do bug]

## Reproduzir
1. Passo 1
2. Passo 2
3. ...

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que acontece]

## Ambiente
- OS: [Windows/Mac/Linux]
- Node: [versão]
- pnpm: [versão]

## Logs
[Cole logs relevantes]
```
