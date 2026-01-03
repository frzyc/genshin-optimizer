import { DropdownButton, NumberInputLazy } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import {
  type MilestoneKey,
  ambiguousLevel,
  ambiguousLevelLow,
  maxLevel,
  maxLevelLow,
  milestoneLevels,
  milestoneLevelsLow,
  milestoneMaxLevel,
  milestoneMaxLevelLow,
} from '@genshin-optimizer/zzz/consts'
import { Box, Button, InputAdornment, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function LevelSelect({
  level,
  milestone,
  setBoth,
  useLow = false,
  disabled = false,
  warning = false,
}: {
  level: number
  milestone: MilestoneKey
  setBoth: (action: { level?: number; milestone?: MilestoneKey }) => void
  useLow?: boolean
  disabled?: boolean
  warning?: boolean
}) {
  const { t } = useTranslation('ui')
  const milestoneMaxLevels = useLow ? milestoneMaxLevelLow : milestoneMaxLevel
  const setLevel = useCallback(
    (level = 1) => {
      level = clamp(level, 1, useLow ? maxLevelLow : maxLevel)
      const milestone = milestoneMaxLevels.findIndex(
        (ascenML) => level <= ascenML
      ) as MilestoneKey
      setBoth({ level, milestone })
    },
    [setBoth, milestoneMaxLevels, useLow]
  )
  const setAscension = useCallback(() => {
    const lowerAscension = milestoneMaxLevels.findIndex(
      (ascenML) => level !== 60 && level === ascenML
    ) as MilestoneKey
    if (milestone === lowerAscension)
      setBoth({ level, milestone: (milestone + 1) as MilestoneKey })
    else setBoth({ level, milestone: lowerAscension })
  }, [setBoth, milestoneMaxLevels, milestone, level])
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
            max: 60,
            sx: { width: '4em' },
          },
          endAdornment: (
            <InputAdornment position="end" sx={{ width: '100%' }}>
              <Button
                sx={{ ml: 'auto' }}
                disabled={
                  !(useLow ? ambiguousLevelLow : ambiguousLevel)(level) ||
                  disabled
                }
                onClick={setAscension}
                color={warning ? 'warning' : undefined}
              >
                <strong>/ {milestoneMaxLevel[milestone]}</strong>
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
        {[...(useLow ? milestoneLevelsLow : milestoneLevels)].map(
          ([lv, as]) => {
            const selected = lv === level && as === milestone

            return (
              <MenuItem
                key={`${lv}/${as}`}
                selected={selected}
                disabled={selected}
                onClick={() => setBoth({ level: lv, milestone: as })}
              >
                {lv === milestoneMaxLevels[as]
                  ? `Lv. ${lv}`
                  : `Lv. ${lv}/${milestoneMaxLevels[as]}`}
              </MenuItem>
            )
          }
        )}
      </DropdownButton>
    </Box>
  )
}
