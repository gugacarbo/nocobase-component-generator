# Fluxo do Bundler – Etapas e Responsáveis

Este documento descreve, passo a passo, o fluxo completo do bundler, quais classes e funções executam cada etapa, e onde estão localizadas no projeto.

## Visão Geral

- **Entrada:** `SimpleBundler.bundle()` em [src/bundler/core/SimpleBundler.ts](src/bundler/core/SimpleBundler.ts)
- **Saída:** Arquivo gerado em `output/` com extensão definida por configuração.
- **Pipeline:** Carregamento → Ordenação → Análise de imports externos → Concatenação e limpeza → Comentários especiais → Tree-shaking → (Opcional) Transformações NocoBase → Export/Render → Formatação e Escrita → Relatório.

## Carregamento de Arquivos

- **Decisão arquivo vs diretório:** `SimpleBundler.loadFiles()` em [src/bundler/core/SimpleBundler.ts](src/bundler/core/SimpleBundler.ts)
  - Arquivo único: `FileProcessor.loadSingleFile()` em [src/bundler/processors/FileProcessor.ts](src/bundler/processors/FileProcessor.ts)
  - Diretório: `FileProcessor.loadDirectory()` em [src/bundler/processors/FileProcessor.ts](src/bundler/processors/FileProcessor.ts)

- **Descoberta de arquivos suportados:** `FileProcessor.findFiles()` percorre recursivamente, respeitando exclusões e extensões definidas em [src/config/bundler-config.ts](src/config/bundler-config.ts)

- **Leitura de conteúdo e imports internos:** `FileProcessor.loadFileInfo()` lê o arquivo e utiliza `FileProcessor.extractImports()` para coletar imports relativos. As informações são agregadas como `FileInfo`.

## Ordenação por Dependência

- **Ordenação (DFS):** `DependencyResolver.sortFilesByDependency()` em [src/bundler/resolvers/DependencyResolver.ts](src/bundler/resolvers/DependencyResolver.ts)
  - Visita dependências antes do arquivo, evita ciclos.

- **Resolução de caminho de import relativo:** `DependencyResolver.resolveImportPath()` tenta:
  - Resolver a partir do diretório do arquivo (`PathUtils.dirname` + `PathUtils.resolve`).
  - Se for diretório, procurar `index.*` (extensões em `APP_CONFIG.bundler.IMPORT_EXTENSIONS`).
  - Adicionar extensões suportadas quando necessário.

## Pipeline de Bundling

- **Orquestração:** `SimpleBundler.generateBundle()` em [src/bundler/core/SimpleBundler.ts](src/bundler/core/SimpleBundler.ts)

1. **Cabeçalho do bundle**
   - `NocoBaseAdapter.generateBundleHeader()` em [src/bundler/adapters/NocoBaseAdapter.ts](src/bundler/adapters/NocoBaseAdapter.ts)

2. **Imports externos (bibliotecas)**
   - Coleta: `CodeAnalyzer.analyzeExternalImports()` em [src/bundler/analyzers/CodeAnalyzer.ts](src/bundler/analyzers/CodeAnalyzer.ts)
   - Geração: `CodeAnalyzer.generateImportStatements()` para inserir `import` das libs externas utilizadas.

3. **Concatenação dos arquivos fonte**
   - `FileProcessor.concatenateFiles()` em [src/bundler/processors/FileProcessor.ts](src/bundler/processors/FileProcessor.ts)
   - Limpeza por arquivo: `FileProcessor.cleanContent()` que executa:
     - `removeImports()` – remove todas as declarações `import` originais.
     - `removeExports()` – remove `export` default/nomeados.
     - `TypeScriptRemover.removeTypes()` (opcional) – remove tipos quando gerando JavaScript.

4. **Processamento de comentários especiais**
   - `NocoBaseAdapter.processComments()` aplica:
     - `//bundle-only:` – mantém apenas o trecho marcado.
     - `//no-bundle` – remove linhas marcadas.
     - Limpeza de comentários e preservação de conteúdo útil.

5. **Tree-shaking (remoção de código não utilizado)**
   - `TreeShaker.shake()` em [src/bundler/processors/TreeShaker.ts](src/bundler/processors/TreeShaker.ts)
   - Baseado em análise estática para reduzir o código.

6. **Transformações NocoBase (opcional)**
   - Quando habilitado para JavaScript, o objetivo é transformar `import` de libs externas em destructuring de `ctx.libs`.
   - Função: `NocoBaseAdapter.transformImports()` em [src/bundler/adapters/NocoBaseAdapter.ts](src/bundler/adapters/NocoBaseAdapter.ts)
   - Observação: a chamada está comentada no fluxo atual em `SimpleBundler.generateBundle()`.

7. **Export/Render do componente principal**
   - Descoberta do componente: `ComponentAnalyzer.findMainComponent()` em [src/bundler/analyzers/ComponentAnalyzer.ts](src/bundler/analyzers/ComponentAnalyzer.ts)
   - Inserção final:
     - JavaScript: `NocoBaseAdapter.generateRender()` via `FileProcessor.generateExport()`
     - TypeScript: `NocoBaseAdapter.generateExport()` via `FileProcessor.generateExport()`

## Geração de Arquivos e Formatação

- **Nomes de saída:** `FileProcessor.getOutputFileName()` baseado no componente principal.
- **Formatação:** `CodeFormatter.format()` em [src/bundler/processors/CodeFormatter.ts](src/bundler/processors/CodeFormatter.ts)
- **Cálculo de caminho de saída:** `FileProcessor.getOutputPath()`
- **Gravação no disco:** `FileProcessor.saveBundle()` chama `ensureDirectory()` e `writeFile()`.

## Relatório de Bundle

- **Resumo e métricas:** `BundleReporter.printReport()` em [src/bundler/reporters/BundleReporter.ts](src/bundler/reporters/BundleReporter.ts)
  - Total de arquivos, tamanho, componente principal, etc.

## Configurações Relevantes

- **Configuração geral:** [src/config/config.ts](src/config/config.ts)
- **Configuração do bundler:** [src/config/bundler-config.ts](src/config/bundler-config.ts)
  - `FILE_EXTENSIONS`, `IMPORT_EXTENSIONS`, `EXCLUDED_FILES`, `EXCLUDED_DIRS`, `LIBRARY_MAPPINGS`, padrões de comentários especiais.

## Integração com Servidor

- **API de bundle:** `handleBundleRequest()` em [src/server/bundle-api.ts](src/server/bundle-api.ts)
  - Resolve paths de componente e saída.
  - Instancia `SimpleBundler` e invoca `bundle()`.
  - Lê o arquivo gerado para retorno opcional de código.

## Observações

- **Imports internos:** no estado atual, apenas imports relativos (`./`, `../`) entram no grafo de dependências para ordenação e concatenação.
- **Imports externos:** são detectados via `CodeAnalyzer` e mantidos como `import` (ou podem ser transformados para `ctx.libs` se habilitado).
