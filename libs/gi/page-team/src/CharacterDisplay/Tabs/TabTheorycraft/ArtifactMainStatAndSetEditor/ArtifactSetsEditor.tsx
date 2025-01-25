import { CardThemed } from '@genshin-optimizer/common/ui'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { getArtSheet } from '@genshin-optimizer/gi/sheets'
import { ArtifactSetAutocomplete } from '@genshin-optimizer/gi/ui'
import { Stack } from '@mui/material'
import { useCallback, useContext } from 'react'
import { BuildTcContext } from '../../../../BuildTcContext'
import { ArtifactSetEditor } from './ArtifactSetEditor'

export function ArtifactSetsEditor({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const {
    buildTc: {
      artifact: { sets: artSet },
    },
    setBuildTc,
  } = useContext(BuildTcContext)
  const setSet = useCallback(
    (setKey: ArtifactSetKey | '') => {
      if (!setKey) return
      setBuildTc((buildTc) => {
        buildTc.artifact.sets[setKey] = parseInt(
          Object.keys(getArtSheet(setKey).setEffects)[0]
        ) as 1 | 2 | 4
      })
    },
    [setBuildTc]
  )

  const remaining = 5 - Object.values(artSet).reduce((a, b) => a + b, 0)

  return (
    <Stack spacing={1} sx={{ flexGrow: 1 }}>
      {Object.keys(artSet).map((setKey) => (
        <ArtifactSetEditor
          key={setKey}
          setKey={setKey as ArtifactSetKey}
          remaining={remaining}
          disabled={disabled}
        />
      ))}
      <CardThemed bgt="light" sx={{ flexGrow: 1, overflow: 'visible' }}>
        <ArtifactSetAutocomplete
          artSetKey={''}
          setArtSetKey={setSet}
          label={'New Artifact Set'}
          blurOnSelect={true}
          getOptionDisabled={({ key }) =>
            Object.keys(artSet).includes(key as ArtifactSetKey) ||
            !key ||
            Object.keys(getArtSheet(key).setEffects).every(
              (n) => parseInt(n) > remaining
            )
          }
          disabled={disabled}
        />
      </CardThemed>
    </Stack>
  )
}
