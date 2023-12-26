export interface SyncRepoExecutorSchema {
  repoUrl: string
  outputPath: string
  branch: string
  prefixPath?: boolean
}
