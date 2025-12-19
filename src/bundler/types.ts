export interface FileInfo {
  path: string
  content: string
  imports: string[]
  relativePath: string
}

export interface BundleOptions {
  removeTypes: boolean
  outputFileName: string
}

export interface BundleResult {
  content: string
  fileCount: number
  sizeKB: number
  files: string[]
}
