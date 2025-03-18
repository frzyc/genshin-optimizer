import type { CharOpt, ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getFormula } from '@genshin-optimizer/zzz/formula'
import { OptimizationTargetSelector } from '@genshin-optimizer/zzz/formula-ui'
import { useMemo } from 'react'

export function OptSelector({
  character: { key: characterKey },
  charOpt: { targetName, targetSheet, targetDamageType1, targetDamageType2 },
}: {
  charOpt: CharOpt
  character: ICachedCharacter
}) {
  const { database } = useDatabaseContext()

  const formula = getFormula(targetSheet, targetName)
  const tag = useMemo(
    () =>
      formula?.tag && {
        ...formula.tag,
        ...(targetDamageType1 ? { damageType1: targetDamageType1 } : {}),
        ...(targetDamageType2 ? { damageType2: targetDamageType2 } : {}),
      },
    [formula?.tag, targetDamageType1, targetDamageType2]
  )

  return (
    <OptimizationTargetSelector
      tag={tag}
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
