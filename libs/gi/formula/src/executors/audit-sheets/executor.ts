import {
  runAudit,
  stripArtifactPlaceholders,
  toCsv,
  writeReport,
} from './auditSheets'
import type { AuditSheetsExecutorSchema } from './schema'

export default async function runExecutor(
  options: AuditSheetsExecutorSchema
): Promise<{ success: boolean }> {
  const format = options.format ?? 'json'
  if (options.stripArtifactPlaceholders) {
    const written = await stripArtifactPlaceholders()
    console.log(`Stripped ${written.length} artifact placeholder stubs`)
  }
  const report = runAudit()
  console.log(JSON.stringify(report.summary, null, 2))
  if (options.outputPath) {
    writeReport(report, options.outputPath, format)
    console.log(`Wrote ${options.outputPath}`)
  } else if (format === 'csv') {
    console.log(toCsv(report))
  }
  return { success: true }
}
