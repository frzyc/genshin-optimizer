import type { CharOpt, ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { OptimizationTargetSelector } from '@genshin-optimizer/zzz/formula-ui'

export function OptSelector({
  character: { key: characterKey },
  charOpt: { targetName, targetSheet },
}: {
  charOpt: CharOpt
  character: ICachedCharacter
}) {
  const { database } = useDatabaseContext()
  return (
    <OptimizationTargetSelector
      sheet={targetSheet}
      name={targetName}
      setOptTarget={({ sheet, name }) =>
        sheet &&
        name &&
        database.charOpts.set(characterKey, {
          targetSheet: sheet,
          targetName: name,
        })
      }
      buttonProps={{
        sx: { height: '100%', flexGrow: 1 },
        variant: targetName ? 'outlined' : undefined,
      }}
    />
  )
}
