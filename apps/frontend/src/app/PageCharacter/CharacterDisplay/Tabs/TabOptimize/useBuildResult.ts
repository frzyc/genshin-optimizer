import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { IBuildResult } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useCallback, useEffect, useState } from 'react'

export default function useBuildResult(characterKey: CharacterKey) {
  const database = useDatabase()
  const [buildResult, setBuildResult] = useState(() =>
    database.buildResult.get(characterKey)
  )
  useEffect(
    () => setBuildResult(database.buildResult.get(characterKey)),
    [database, characterKey]
  )
  useEffect(
    () =>
      database.buildResult.follow(
        characterKey,
        (k, r, v) => r === 'update' && setBuildResult(v)
      ),
    [characterKey, setBuildResult, database]
  )
  const buildResultDispatch = useCallback(
    (action: Partial<IBuildResult>) =>
      characterKey && database.buildResult.set(characterKey, action),
    [characterKey, database]
  )

  return { buildResult, buildResultDispatch }
}
