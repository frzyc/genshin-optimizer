import { CardThemed } from '@genshin-optimizer/common/ui'
import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { DiscLevelSlider } from '@genshin-optimizer/zzz/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { memo } from 'react'

export const LevelFilter = memo(function LevelFilter({
  locationKey,
  disabled = false,
}: {
  locationKey: LocationKey
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const character = useCharacter(locationKey)
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Disc Level Filter
          {/* TODO: Translate */}
          {/* {t('levelFilter')} */}
        </Typography>
      </CardContent>
      <Divider />
      <DiscLevelSlider
        levelLow={character?.levelLow ?? 15}
        levelHigh={character?.levelHigh ?? 15}
        setLow={(levelLow) =>
          character && database.chars.set(character.key, { levelLow })
        }
        setHigh={(levelHigh) =>
          character && database.chars.set(character.key, { levelHigh })
        }
        setBoth={(levelLow, levelHigh) =>
          character &&
          database.chars.set(character.key, {
            levelLow,
            levelHigh,
          })
        }
        disabled={disabled || !character}
      />
    </CardThemed>
  )
})
