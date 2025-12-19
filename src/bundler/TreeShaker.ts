import * as ts from 'typescript'

/**
 * Remove código não utilizado (dead code elimination)
 */
export class TreeShaker {
  /**
   * Identifica todas as exportações/declarações no código
   */
  private findDeclarations(content: string): Set<string> {
    const declarations = new Set<string>()
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    )

    const visit = (node: ts.Node) => {
      // Funções declaradas
      if (ts.isFunctionDeclaration(node) && node.name) {
        declarations.add(node.name.text)
      }
      // Variáveis, constantes, arrow functions
      else if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name)) {
            declarations.add(decl.name.text)
          }
        })
      }
      // Classes
      else if (ts.isClassDeclaration(node) && node.name) {
        declarations.add(node.name.text)
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return declarations
  }

  /**
   * Identifica todos os identificadores usados no código
   */
  private findUsages(content: string, excludeDeclarations: Set<string>): Set<string> {
    const usages = new Set<string>()
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    )

    const visit = (node: ts.Node) => {
      // Só processa identificadores que não são declarações
      if (ts.isIdentifier(node)) {
        const parent = node.parent
        
        // Ignora nomes de declarações (lado esquerdo)
        const isDeclaration = 
          ts.isFunctionDeclaration(parent) ||
          ts.isVariableDeclaration(parent) ||
          ts.isClassDeclaration(parent) ||
          ts.isParameter(parent)
        
        if (!isDeclaration || !excludeDeclarations.has(node.text)) {
          usages.add(node.text)
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return usages
  }

  /**
   * Remove declarações não utilizadas do código combinado
   */
  public shake(combinedContent: string): string {
    // Encontra todas as declarações
    const declarations = this.findDeclarations(combinedContent)
    
    // Encontra todos os usos
    const usages = this.findUsages(combinedContent, declarations)
    
    // Identifica componentes principais (começam com maiúscula - geralmente React components)
    const mainComponents = new Set<string>()
    declarations.forEach(decl => {
      if (decl[0] === decl[0].toUpperCase()) {
        mainComponents.add(decl)
      }
    })
    
    // Identifica declarações não usadas (exceto componentes principais)
    const unused = new Set<string>()
    declarations.forEach(decl => {
      if (!usages.has(decl) && !mainComponents.has(decl)) {
        unused.add(decl)
      }
    })

    // Se não há código não utilizado, retorna o original
    if (unused.size === 0) {
      return combinedContent
    }

    // Remove declarações não utilizadas
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      combinedContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    )

    const nodesToRemove: ts.Node[] = []

    const visit = (node: ts.Node) => {
      // Marca funções não usadas para remoção
      if (ts.isFunctionDeclaration(node) && node.name) {
        if (unused.has(node.name.text)) {
          nodesToRemove.push(node)
        }
      }
      // Marca variáveis não usadas para remoção
      else if (ts.isVariableStatement(node)) {
        const hasUnused = node.declarationList.declarations.some(decl => {
          if (ts.isIdentifier(decl.name)) {
            return unused.has(decl.name.text)
          }
          return false
        })
        if (hasUnused) {
          nodesToRemove.push(node)
        }
      }
      // Marca classes não usadas para remoção
      else if (ts.isClassDeclaration(node) && node.name) {
        if (unused.has(node.name.text)) {
          nodesToRemove.push(node)
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    // Remove os nodos marcados
    let result = combinedContent
    nodesToRemove.reverse().forEach(node => {
      const start = node.getStart(sourceFile)
      const end = node.getEnd()
      result = result.substring(0, start) + result.substring(end)
    })

    // Limpa linhas vazias excessivas
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

    return result.trim()
  }
}
