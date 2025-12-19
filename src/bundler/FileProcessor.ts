import * as fs from 'fs'
import * as path from 'path'
import { FileInfo } from './types'
import { TypeScriptRemover } from './TypeScriptRemover'

/**
 * Processa arquivos individuais
 */
export class FileProcessor {
  private static readonly EXCLUDED_FILES = ['main.tsx', 'App.tsx', 'bundler.ts', 'index.ts']
  private static readonly FILE_EXTENSIONS = /\.(tsx?|jsx?)$/

  /**
   * Encontra todos os arquivos .tsx e .ts recursivamente
   */
  public static findFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir)

    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // Ignora node_modules, output e bundler
        if (!filePath.includes('node_modules') && 
            !filePath.includes('output') && 
            !filePath.includes('bundler')) {
          this.findFiles(filePath, fileList)
        }
      } else if (file.match(this.FILE_EXTENSIONS)) {
        // Ignora arquivos específicos
        if (!this.EXCLUDED_FILES.some(excluded => file.includes(excluded))) {
          fileList.push(filePath)
        }
      }
    })

    return fileList
  }

  /**
   * Extrai os imports de um arquivo
   */
  public static extractImports(content: string): string[] {
    const imports: string[] = []
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g
    
    let match
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]
      // Ignora imports externos (node_modules)
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue
      }
      imports.push(importPath)
    }

    return imports
  }

  /**
   * Remove imports, exports e opcionalmente tipos do TypeScript
   */
  public static cleanContent(content: string, fileName: string, removeTypes: boolean = false): string {
    let cleaned = content

    // Remove todos os imports
    cleaned = cleaned.replace(/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]\s*;?\n?/g, '')
    
    // Remove linhas completas com export default + identificador (ex: export default MyComponent)
    cleaned = cleaned.replace(/^\s*export\s+default\s+\w+\s*;?\s*$/gm, '')
    
    // Remove export default de declarações inline mantendo a declaração
    cleaned = cleaned.replace(/export\s+default\s+/g, '')
    
    // Remove export named
    cleaned = cleaned.replace(/export\s+(?=const|let|var|function|class|interface|type|enum)/g, '')
    
    // Remove export { ... }
    cleaned = cleaned.replace(/export\s*\{[^}]*\}\s*;?\n?/g, '')

    // Remove TypeScript se solicitado usando o compilador nativo
    if (removeTypes) {
      cleaned = TypeScriptRemover.removeTypes(cleaned, fileName)
    }

    // Remove linhas vazias consecutivas
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n')

    return cleaned.trim()
  }

  /**
   * Carrega informações de um arquivo
   */
  public static loadFileInfo(filePath: string, srcDir: string): FileInfo {
    const content = fs.readFileSync(filePath, 'utf-8')
    const imports = this.extractImports(content)
    const relativePath = path.relative(srcDir, filePath)

    return {
      path: filePath,
      content,
      imports,
      relativePath
    }
  }
}
