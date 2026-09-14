export interface AuditSheetsExecutorSchema {
  outputPath?: string
  format?: 'json' | 'csv'
  stripArtifactPlaceholders?: boolean
}
