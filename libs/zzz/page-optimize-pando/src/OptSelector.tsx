import type { CharOpt, ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { OptimizationTargetSelector } from '@genshin-optimizer/zzz/formula-ui'

export function OptSelector({
  character: { key: characterKey },
  charOpt: { target },
}: {
  charOpt: CharOpt
  character: ICachedCharacter
}) {
  const { database } = useDatabaseContext()
  return (
    <OptimizationTargetSelector
      optTarget={target}
      setOptTarget={(tag) =>
        database.charOpts.set(characterKey, {
          target: tag,
        })
      }
      buttonProps={{ fullWidth: true, sx: { height: '100%' } }}
    />
  )
}
