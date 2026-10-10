/**
 * Report UI coverage gaps after formula ports.
 */
import { buildCoverageReport, printCoverageReport } from './lib/coverage'

const report = buildCoverageReport()
printCoverageReport(report)

const exitCode =
  report.char.missing.length || report.art.missingFromConsts.length ? 1 : 0

if (exitCode) process.exit(exitCode)
