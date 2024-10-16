import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { ComboMetaDataum } from '@genshin-optimizer/sr/db'
import {
  CharacterAutocomplete,
  useCombo,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function TeamSelectors({ comboId }: { comboId: string }) {
  const combo = useCombo(comboId)!

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {combo.comboMetadata.map((meta, index) => (
        <TeammateSelector
          key={`${index}_${meta?.characterKey}`}
          comboMetadataIndex={index}
          comboId={comboId}
        />
      ))}
    </Box>
  )
}

function TeammateSelector({
  comboMetadataIndex,
  comboId,
}: {
  comboMetadataIndex: number
  comboId: string
}) {
  const { database } = useDatabaseContext()
  const combo = useCombo(comboId)!

  function setCharKey(cKey: CharacterKey | '') {
    // Remove teammate
    if (cKey === '') {
      database.teams.set(
        comboId,
        (team) => (team.loadoutMetadata[comboMetadataIndex] = undefined)
      )
      return
    }

    // Create char if needed
    database.chars.getOrCreate(cKey)

    // Check if character is already in the team.
    const existingIndex = combo.comboMetadata.findIndex(
      (comboMetadatum) => comboMetadatum?.characterKey === cKey
    )
    // If not exists, insert it
    if (existingIndex === -1) {
      // If none, create it
      database.combos.set(comboId, (combo) => {
        // Let the validator handle default properties for everything else
        combo.comboMetadata[comboMetadataIndex] = {
          characterKey: cKey,
        } as ComboMetaDataum
      })
    }
    // If exists already, swap positions
    else {
      if (existingIndex === comboMetadataIndex) return
      const existingMeta = combo.comboMetadata[existingIndex]
      const destMeta = combo.comboMetadata[comboMetadataIndex]
      database.combos.set(comboId, (combo) => {
        combo.comboMetadata[comboMetadataIndex] = existingMeta
        combo.comboMetadata[existingIndex] = destMeta
      })
    }
  }

  return (
    <CharacterAutocomplete
      charKey={combo.comboMetadata[comboMetadataIndex]?.characterKey ?? ''}
      setCharKey={setCharKey}
    />
  )
}
