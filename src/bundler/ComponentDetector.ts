import * as ts from 'typescript'

/**
 * Identifica o componente principal do bundle
 */
export class ComponentDetector {
  /**
   * Encontra o componente principal (último componente React com export default)
   */
  public static findMainComponent(files: Map<string, string>): string | null {
    let mainComponent: string | null = null
    
    // Verifica cada arquivo em ordem reversa (último arquivo geralmente é o principal)
    const filesArray = Array.from(files.entries()).reverse()
    
    for (const [_, content] of filesArray) {
      // Verifica se tem export default
      if (content.includes('export default')) {
        const componentName = this.extractExportedComponent(content)
        if (componentName) {
          mainComponent = componentName
          break
        }
      }
    }
    
    // Se não encontrou, procura por componentes React (começam com maiúscula)
    if (!mainComponent) {
      for (const [_, content] of filesArray) {
        const components = this.findReactComponents(content)
        if (components.length > 0) {
          mainComponent = components[0]
          break
        }
      }
    }
    
    return mainComponent
  }

  /**
   * Extrai o nome do componente exportado como default
   */
  private static extractExportedComponent(content: string): string | null {
    // export default MyComponent
    const match = content.match(/export\s+default\s+(\w+)/)
    if (match) {
      return match[1]
    }
    
    // export default function MyComponent
    const funcMatch = content.match(/export\s+default\s+function\s+(\w+)/)
    if (funcMatch) {
      return funcMatch[1]
    }
    
    // const MyComponent = ... \n export default MyComponent
    const constMatch = content.match(/const\s+(\w+)\s*[:=].*export\s+default\s+\1/s)
    if (constMatch) {
      return constMatch[1]
    }
    
    return null
  }

  /**
   * Encontra componentes React no código (começam com maiúscula)
   */
  private static findReactComponents(content: string): string[] {
    const components: string[] = []
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    )

    const visit = (node: ts.Node) => {
      // Componentes funcionais: const MyComponent = () => {}
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name)) {
            const name = decl.name.text
            // Componentes React começam com maiúscula
            if (name[0] === name[0].toUpperCase()) {
              components.push(name)
            }
          }
        })
      }
      // Componentes como function: function MyComponent() {}
      else if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.text
        if (name[0] === name[0].toUpperCase()) {
          components.push(name)
        }
      }
      // Classes: class MyComponent extends React.Component
      else if (ts.isClassDeclaration(node) && node.name) {
        const name = node.name.text
        if (name[0] === name[0].toUpperCase()) {
          components.push(name)
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return components
  }
}
