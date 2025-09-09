import { DropdownButton, NumberInputLazy } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import type { AscensionKey } from '@genshin-optimizer/gi/consts'
import {
  charAmbiguousLevel,
  charAmbiguousLevelLow,
  charAscensionMaxLevel,
  charAscensionMaxLevelLow,
  charMaxLevel,
  charMaxLevelLow,
  charMilestoneLevels,
  charMilestoneLevelsLow,
} from '@genshin-optimizer/gi/util'
import { Box, Button, InputAdornment, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterLevelSelect({
  level,
  ascension,
  setBoth,
  useLow = false,
  disabled = false,
  warning = false,
}: {
  level: number
  ascension: AscensionKey
  setBoth: (action: { level?: number; ascension?: AscensionKey }) => void
  useLow?: boolean
  disabled?: boolean
  warning?: boolean
}) {
  const { t } = useTranslation('ui')
  const ascensionMaxLevels = useLow
    ? charAscensionMaxLevelLow
    : charAscensionMaxLevel
  const setLevel = useCallback(
    (level = 1) => {
      level = clamp(level, 1, useLow ? charMaxLevelLow : charMaxLevel)
      const ascension = ascensionMaxLevels.findIndex(
        (ascenML) => level <= ascenML
      ) as AscensionKey
      setBoth({ level, ascension })
    },
    [setBoth, ascensionMaxLevels, useLow]
  )
  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevels.findIndex(
      (ascenML) => level !== 90 && level === ascenML
    ) as AscensionKey
    if (ascension === lowerAscension)
      setBoth({ ascension: (ascension + 1) as AscensionKey })
    else setBoth({ ascension: lowerAscension })
  }, [setBoth, ascensionMaxLevels, ascension, level])
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: '4px' }}>
      <NumberInputLazy
        variant="filled"
        value={level}
        disabled={disabled}
        onChange={(e) => {
          setLevel(e || 1)
        }}
        type="number"
        InputProps={{
          inputProps: {
            min: 0,
            max: 100,
            sx: { width: '4em' },
          },
          endAdornment: (
            <InputAdornment position="end" sx={{ width: '100%' }}>
              <Button
                sx={{ ml: 'auto' }}
                disabled={
                  !(useLow ? charAmbiguousLevelLow : charAmbiguousLevel)(
                    level
                  ) || disabled
                }
                onClick={setAscension}
                color={warning ? 'warning' : undefined}
              >
                <strong>/ {charAscensionMaxLevel[ascension]}</strong>
              </Button>
            </InputAdornment>
          ),
        }}
        color={warning ? 'warning' : undefined}
        focused={warning ? true : undefined}
        sx={{ height: '100%', mr: '4px', flexGrow: 1 }}
        label="Level"
      />
      <DropdownButton
        title={t('selectlevel')}
        sx={{ borderRadius: '4px', width: '100px', flexGrow: 1 }}
        disabled={disabled}
        color={warning ? 'warning' : undefined}
      >
        {[...(useLow ? charMilestoneLevelsLow : charMilestoneLevels)].map(
          ([lv, as]) => {
            const selected = lv === level && as === ascension
            return (
              <MenuItem
                key={`${lv}/${as}`}
                selected={selected}
                disabled={selected}
                onClick={() => setBoth({ level: lv, ascension: as })}
              >
                {lv === ascensionMaxLevels[as]
                  ? `Lv. ${lv}`
                  : `Lv. ${lv}/${ascensionMaxLevels[as]}`}
              </MenuItem>
            )
          }
        )}
      </DropdownButton>
    </Box>
  )
}
