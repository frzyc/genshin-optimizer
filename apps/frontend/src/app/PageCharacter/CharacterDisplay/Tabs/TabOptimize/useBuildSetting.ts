import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { BuildSetting } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useCallback, useEffect, useState } from 'react'

export default function useBuildSetting(characterKey: CharacterKey) {
  const database = useDatabase()
  const [buildSetting, setBuildSetting] = useState(() =>
    database.buildSettings.get(characterKey)
  )
  useEffect(
    () => setBuildSetting(database.buildSettings.get(characterKey)),
    [database, characterKey]
  )
  useEffect(
    () =>
      database.buildSettings.follow(
        characterKey,
        (k, r, v) => r === 'update' && setBuildSetting(v)
      ),
    [characterKey, setBuildSetting, database]
  )
  const buildSettingDispatch = useCallback(
    (action: Partial<BuildSetting>) =>
      characterKey && database.buildSettings.set(characterKey, action),
    [characterKey, database]
  )

  return { buildSetting: buildSetting as BuildSetting, buildSettingDispatch }
}
