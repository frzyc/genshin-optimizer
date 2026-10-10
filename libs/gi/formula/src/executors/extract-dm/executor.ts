import { isCharacterKey } from '@genshin-optimizer/gi/consts'
import { extractDmAll, extractDmForKey } from './extractDm'
import type { ExtractDmExecutorSchema } from './schema'

export default async function runExecutor(
  options: ExtractDmExecutorSchema
): Promise<{ success: boolean }> {
  const { sheet, all, force, dryRun } = options
  if (!sheet && !all) {
    console.error('Pass --sheet=<CharacterKey> or --all')
    return { success: false }
  }
  if (sheet && !isCharacterKey(sheet)) {
    console.error(`Unknown character key: ${sheet}`)
    return { success: false }
  }

  const results = sheet
    ? [await extractDmForKey(sheet, { force, dryRun })]
    : await extractDmAll({ force, dryRun })

  const counts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.action] = (acc[r.action] ?? 0) + 1
    return acc
  }, {})
  console.log(
    JSON.stringify(
      {
        dryRun: !!dryRun,
        counts,
        results: results.filter((r) => r.action !== 'skipped'),
      },
      null,
      2
    )
  )
  return { success: true }
}
