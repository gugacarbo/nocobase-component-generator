import * as prettier from 'prettier'

/**
 * Formata o código usando Prettier
 */
export class CodeFormatter {
  /**
   * Formata o código com configurações padrão
   */
  public static async format(content: string, isTypeScript: boolean): Promise<string> {
    try {
      const formatted = await prettier.format(content, {
        parser: isTypeScript ? 'typescript' : 'babel',
        semi: true,
        singleQuote: false,
        tabWidth: 4,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
        printWidth: 80,
        endOfLine: 'lf',
        jsxBracketSameLine: false,
      })
      
      return formatted
    } catch (error) {
      console.warn('⚠️  Erro ao formatar código, retornando original:', error)
      return content
    }
  }

  /**
   * Formata de forma síncrona (fallback sem prettier)
   */
  public static formatSync(content: string): string {
    try {
      // Formatação básica sem prettier
      let formatted = content

      // Remove espaços extras no final das linhas
      formatted = formatted.replace(/[ \t]+$/gm, '')

      // Garante linha vazia no final do arquivo
      if (!formatted.endsWith('\n')) {
        formatted += '\n'
      }

      // Remove mais de 2 linhas vazias consecutivas
      formatted = formatted.replace(/\n{3,}/g, '\n\n')

      return formatted
    } catch (error) {
      console.warn('⚠️  Erro ao formatar código:', error)
      return content
    }
  }
}
