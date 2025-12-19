import * as ts from 'typescript'

/**
 * Remove todas as anotações de tipo do TypeScript usando o compilador oficial
 */
export class TypeScriptRemover {
  /**
   * Remove tipos, interfaces, enums e outras anotações TypeScript
   * Usa o compilador TypeScript nativo para garantir transformação correta
   */
  public static removeTypes(content: string, fileName: string = 'source.tsx'): string {
    // Configurações do compilador para transpilação
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      removeComments: false,
      isolatedModules: true,
      skipLibCheck: true,
    }

    // Transpila TypeScript para JavaScript
    const result = ts.transpileModule(content, {
      compilerOptions,
      fileName,
    })

    return result.outputText
  }

  /**
   * Verifica se um arquivo é TypeScript
   */
  public static isTypeScriptFile(filePath: string): boolean {
    return /\.tsx?$/.test(filePath)
  }
}
