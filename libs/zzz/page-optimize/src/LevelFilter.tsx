import { CardThemed, CustomNumberInput } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Box, CardContent, Divider, Slider, Typography } from '@mui/material'
import { memo, useCallback, useEffect, useState } from 'react'

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
          Artifact Level Filter
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

function DiscLevelSlider({
  levelLow,
  levelHigh,
  setLow,
  setHigh,
  setBoth,
  dark = false,
  disabled = false,
}: {
  levelLow: number
  levelHigh: number
  setLow: (low: number) => void
  setHigh: (high: number) => void
  setBoth: (low: number, high: number) => void
  dark?: boolean
  disabled?: boolean
}) {
  const [sliderLow, setsliderLow] = useState(levelLow)
  const [sliderHigh, setsliderHigh] = useState(levelHigh)
  const setSlider = useCallback(
    (_: unknown, value: number | number[]) => {
      if (typeof value == 'number') throw new TypeError()
      const [l, h] = value
      setsliderLow(l)
      setsliderHigh(h)
    },
    [setsliderLow, setsliderHigh]
  )
  useEffect(() => setsliderLow(levelLow), [setsliderLow, levelLow])

  useEffect(() => setsliderHigh(levelHigh), [setsliderHigh, levelHigh])
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        bgcolor: dark ? 'contentNormal.main' : 'contentLight.main',
        overflow: 'visible',
      }}
    >
      <Box sx={{ width: 'max-content', height: 32, display: 'flex' }}>
        <CustomNumberInput
          value={sliderLow}
          onChange={(val) => setLow(clamp(val ?? 0, 0, levelHigh))}
          sx={{
            px: 1,
            width: '3em',
          }}
          inputProps={{ sx: { textAlign: 'center' } }}
          disabled={disabled}
        />
      </Box>
      <Slider
        sx={{ flex: '0 1 100%', mx: 2 }}
        getAriaLabel={() => 'Arifact Level Range'}
        value={[sliderLow, sliderHigh]}
        onChange={setSlider}
        onChangeCommitted={(_, value) =>
          Array.isArray(value) && setBoth(value[0], value[1])
        }
        valueLabelDisplay="auto"
        min={0}
        max={15}
        step={1}
        marks
        disabled={disabled}
      />
      <CustomNumberInput
        value={sliderHigh}
        onChange={(val) => setHigh(clamp(val ?? 0, levelLow, 15))}
        sx={{ px: 1, flex: '0 0 3em' }}
        inputProps={{ sx: { textAlign: 'center' } }}
        disabled={disabled}
      />
    </Box>
  )
}
