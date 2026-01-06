# Contribuindo para NocoBase Component Generator

Obrigado por considerar contribuir! Este documento fornece diretrizes para contribuir com o projeto.

## Código de Conduta

### Nossa Promessa

Nós, como membros, contribuidores e líderes, nos comprometemos a fazer da participação em nossa comunidade uma experiência livre de assédio para todos.

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo:

- Usar linguagem acolhedora e inclusiva
- Respeitar pontos de vista e experiências diferentes
- Aceitar críticas construtivas graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

Exemplos de comportamento inaceitável:

- Uso de linguagem ou imagens sexualizadas
- Comentários insultuosos ou depreciativos (trolling)
- Assédio público ou privado
- Publicar informações privadas de outros sem permissão
- Outras condutas que possam ser consideradas inadequadas

## Como Contribuir

### Reportando Bugs

Antes de criar um issue:

1. **Verifique se o bug já foi reportado** procurando em [Issues](https://github.com/user/repo/issues)
2. **Verifique se está na versão mais recente**
3. **Colete informações** sobre o bug

**Template de Bug Report:**

```markdown
## Descrição
[Descrição clara e concisa do bug]

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

## Comportamento Esperado
[O que você esperava que acontecesse]

## Comportamento Atual
[O que realmente aconteceu]

## Screenshots
[Se aplicável, adicione screenshots]

## Ambiente
- OS: [ex: Windows 11, macOS 13, Ubuntu 22.04]
- Node: [ex: 18.17.0]
- pnpm: [ex: 8.6.0]
- Versão: [ex: 1.0.0]

## Informações Adicionais
[Qualquer outra informação relevante]

## Logs
[Cole logs relevantes aqui]
```

### Sugerindo Melhorias

**Template de Feature Request:**

```markdown
## É relacionado a um problema?
[Descrição clara do problema. Ex: "Fico frustrado quando..."]

## Solução Desejada
[Descrição clara do que você quer que aconteça]

## Alternativas Consideradas
[Descrição de soluções alternativas que você considerou]

## Contexto Adicional
[Qualquer outro contexto ou screenshots sobre a sugestão]
```

### Pull Requests

#### Processo

1. **Fork o repositório**

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/nocobase-component-generator.git
cd nocobase-component-generator

# Adicione o upstream
git remote add upstream https://github.com/original/nocobase-component-generator.git
```

2. **Crie uma branch**

```bash
# Atualize sua branch main
git checkout main
git pull upstream main

# Crie uma branch para sua feature
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix
```

3. **Faça suas mudanças**

- Siga os padrões de código do projeto
- Adicione testes se aplicável
- Atualize documentação se necessário
- Faça commits semânticos

4. **Commit suas mudanças**

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

**Convenção de Commits:**

Siga [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

[corpo opcional]

[rodapé opcional]
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto-e-vírgula faltando, etc
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Adição de testes
- `chore`: Mudanças em ferramentas, configs, etc

**Exemplos:**

```bash
git commit -m "feat(bundler): adiciona suporte para JSX"
git commit -m "fix(analyzer): corrige detecção de componentes anônimos"
git commit -m "docs: atualiza guia de instalação"
git commit -m "refactor(loader): simplifica lógica de carregamento"
git commit -m "perf(analyzer): otimiza análise de imports"
git commit -m "test(bundler): adiciona testes para SimpleBundler"
```

5. **Push para o GitHub**

```bash
git push origin feature/minha-feature
```

6. **Abra um Pull Request**

- Vá para o repositório no GitHub
- Clique em "New Pull Request"
- Selecione sua branch
- Preencha o template do PR

**Template de Pull Request:**

```markdown
## Descrição
[Descrição clara das mudanças]

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um issue)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (fix ou feature que causa mudança em funcionalidade existente)
- [ ] Documentação

## Como Foi Testado?
[Descreva os testes que você executou]

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Fiz uma auto-revisão do código
- [ ] Comentei código em áreas difíceis de entender
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que meu fix/feature funciona
- [ ] Testes unitários novos e existentes passam localmente
- [ ] Build passa sem erros

## Issues Relacionados
Closes #123
Fixes #456
```

#### Revisão de Código

Seu PR será revisado por mantenedores. Eles podem:

- Aprovar e fazer merge
- Solicitar mudanças
- Fazer comentários/sugestões
- Fechar se não for adequado

**Seja receptivo a feedback!**

### Padrões de Código

#### TypeScript

```typescript
// ✅ Bom
interface UserData {
  id: number;
  name: string;
  email: string;
}

function getUserById(id: number): UserData | null {
  // ...
}

// ❌ Evite
function getUserById(id) {
  // ...
}
```

#### Nomenclatura

```typescript
// Classes: PascalCase
class SimpleBundler {}

// Interfaces: PascalCase
interface FileInfo {}

// Tipos: PascalCase
type Status = "loading" | "success";

// Funções: camelCase
function processFile() {}

// Variáveis: camelCase
const filePath = "...";

// Constantes: UPPER_SNAKE_CASE
const MAX_SIZE = 1024;

// Componentes React: PascalCase
function Button() {}

// Hooks: camelCase com 'use'
function useComponentLoader() {}
```

#### Imports

```typescript
// ✅ Ordem correta
import * as React from 'react';           // Bibliotecas externas
import { Button } from 'antd';

import { Logger } from '@common/Logger';  // Aliases internos
import { PathUtils } from '@bundler/utils';

import { helper } from './utils';         // Relativos
import type { Props } from './types';     // Types

// ❌ Evite misturar
```

#### Formatação

O projeto usa Prettier. Configure seu editor para formatar automaticamente.

```bash
# Formatar todos os arquivos
pnpm format

# Verificar formatação
pnpm format:check
```

### Testes

#### Estrutura

```typescript
// tests/unit/analyzers/ComponentAnalyzer.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentAnalyzer } from '@bundler/analyzers/ComponentAnalyzer';

describe('ComponentAnalyzer', () => {
  describe('findMainComponent', () => {
    it('deve encontrar componente com export default', () => {
      // Arrange
      const files = new Map([
        ['Button.tsx', 'export default function Button() {}']
      ]);
      
      // Act
      const result = ComponentAnalyzer.findMainComponent(files);
      
      // Assert
      expect(result).toBe('Button');
    });
  });
});
```

#### Executar Testes

```bash
# Todos os testes
pnpm test

# Arquivo específico
pnpm test ComponentAnalyzer.test.ts

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Documentação

#### Comentários JSDoc

```typescript
/**
 * Encontra o componente principal no código
 * 
 * @param files - Map de conteúdos de arquivos
 * @returns Nome do componente ou null se não encontrado
 * 
 * @example
 * ```typescript
 * const files = new Map([['Button.tsx', 'export default Button']]);
 * const component = ComponentAnalyzer.findMainComponent(files);
 * // Retorna: "Button"
 * ```
 */
public static findMainComponent(files: Map<string, string>): string | null {
  // ...
}
```

#### README

Ao adicionar features, atualize:

- `README.md`: Documentação principal
- `docs/ARCHITECTURE.md`: Se muda arquitetura
- `docs/BUNDLER_API.md`: Se adiciona/muda API
- `docs/DEVELOPMENT.md`: Se afeta desenvolvimento
- `docs/NOCOBASE.md`: Se afeta integração NocoBase

### Estilo de Commit

#### Mensagens Boas

```bash
✅ "feat(bundler): adiciona suporte para componentes JSX"
✅ "fix(analyzer): corrige bug em detecção de imports circulares"
✅ "docs: atualiza guia de instalação com requisitos de Node 18+"
✅ "perf(loader): otimiza carregamento paralelo de arquivos (2x mais rápido)"
✅ "refactor(processor): simplifica lógica de concatenação de arquivos"
```

#### Mensagens Ruins

```bash
❌ "fix bug"
❌ "update"
❌ "WIP"
❌ "asdf"
❌ "mudanças"
```

### Git Workflow

#### Branches

```
main
├── develop
│   ├── feature/add-jsx-support
│   ├── feature/improve-error-handling
│   ├── fix/circular-dependency-bug
│   └── docs/update-api-reference
```

#### Sincronizar com Upstream

```bash
# Periodicamente sincronize seu fork
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

#### Resolver Conflitos

```bash
# Se houver conflitos durante merge
git fetch upstream
git checkout feature/minha-feature
git merge upstream/main

# Resolva conflitos manualmente
# Depois:
git add .
git commit -m "merge: resolve conflitos com upstream/main"
git push origin feature/minha-feature
```

## Comunidade

### Onde Obter Ajuda

- **GitHub Issues**: Para bugs e features
- **GitHub Discussions**: Para perguntas e discussões
- **Discord/Slack**: Para chat em tempo real (se disponível)

### Etiqueta

- Seja respeitoso e profissional
- Seja paciente com revisores e outros contribuidores
- Aceite feedback construtivamente
- Ajude outros quando possível

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

## Reconhecimentos

Todos os contribuidores serão reconhecidos no projeto. Obrigado por tornar este projeto melhor!

---

**Dúvidas?** Abra uma issue ou discussion no GitHub.

**Primeira contribuição?** Procure por issues marcadas com `good first issue` ou `help wanted`.
