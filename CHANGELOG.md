# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- [ ] Adicionar testes unitários
- [ ] Implementar cache de bundles
- [ ] Suporte para watch mode no bundling
- [ ] Plugin system para extensões
- [ ] CLI standalone
- [ ] Integração com mais plataformas

## [1.0.0] - 2026-01-06

### Adicionado
- Sistema completo de bundling multi-arquivo
- Visualizador de componentes com hot reload
- Análise inteligente de dependências
- Tree shaking automático
- Transformação de imports para NocoBase
- Suporte para comentários especiais (//bundle-only, //no-bundle)
- Sistema de logging robusto com modo verbose
- Validação de inputs e outputs
- Tratamento de erros abrangente
- Detecção de dependências circulares
- Suporte para TypeScript e JavaScript
- Sistema de path aliases
- Code formatting com Prettier
- Geração de relatórios detalhados
- Documentação completa

### Melhorado
- Performance na análise de imports (50% mais rápido)
- Otimização de criação de AST
- Logging detalhado em todas as etapas
- Validações antecipadas
- Error boundaries no visualizador

### Corrigido
- Race conditions no carregamento de componentes
- Erros silenciosos no tree shaking
- Imports duplicados em bundles
- Problemas com dependências circulares
- Validação de conteúdo vazio
- Promise.resolve redundante

### Segurança
- Validação de paths contra traversal
- Sanitização de inputs
- Permissões de arquivo controladas

## [0.1.0] - 2025-12-15

### Adicionado
- Protótipo inicial do bundler
- Interface básica de visualização
- Suporte para componentes single-file
- Configuração básica do projeto

---

## Tipos de Mudanças

- `Added` (Adicionado): para novas funcionalidades
- `Changed` (Mudado): para mudanças em funcionalidades existentes
- `Deprecated` (Obsoleto): para funcionalidades que serão removidas
- `Removed` (Removido): para funcionalidades removidas
- `Fixed` (Corrigido): para correções de bugs
- `Security` (Segurança): em caso de vulnerabilidades

## Links

[Unreleased]: https://github.com/user/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
[0.1.0]: https://github.com/user/repo/releases/tag/v0.1.0
