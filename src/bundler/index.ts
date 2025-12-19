import * as path from 'path'
import { fileURLToPath } from 'url'
import { SimpleBundler } from './SimpleBundler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuração dos diretórios
const srcDir = path.resolve(__dirname, '../')
const outputDir = path.resolve(__dirname, '../../output')

// Executa o bundler (agora é async)
const bundler = new SimpleBundler(srcDir, outputDir)
bundler.bundle().catch(error => {
  console.error('❌ Erro ao gerar bundle:', error)
  process.exit(1)
})
