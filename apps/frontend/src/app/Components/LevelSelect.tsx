import type { AscensionKey } from '@genshin-optimizer/consts'
import type { ICharacterTalent } from '@genshin-optimizer/gi-good'
import {
  ambiguousLevel,
  ambiguousLevelLow,
  ascensionMaxLevel,
  ascensionMaxLevelLow,
  maxLevel,
  maxLevelLow,
  milestoneLevels,
  milestoneLevelsLow,
  validateTalent,
} from '@genshin-optimizer/gi-util'
import { clamp } from '@genshin-optimizer/util'
import { Button, ButtonGroup, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import CustomNumberInput, {
  CustomNumberInputButtonGroupWrapper,
} from './CustomNumberInput'
import DropdownButton from './DropdownMenu/DropdownButton'

export default function LevelSelect({
  level,
  ascension,
  dispatch,
  talent,
  useLow = false,
  disabled = false,
}: {
  level: number
  ascension: AscensionKey
  dispatch: (action: {
    level?: number
    ascension?: AscensionKey
    talent?: ICharacterTalent
  }) => void
  talent?: ICharacterTalent
  useLow?: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation('ui')
  const ascensionMaxLevels = useLow ? ascensionMaxLevelLow : ascensionMaxLevel
  const setLevelAndAscensionWithTalentClamp = useCallback(
    (newLevelAndAscension: {
      level?: number
      ascension: AscensionKey
      talent?: ICharacterTalent
    }) => {
      const dispatchSettings = newLevelAndAscension
      // If changing ascension for a Character, clamp their talent levels
      if (talent) {
        dispatchSettings.talent = validateTalent(ascension, talent)
      }
      dispatch(dispatchSettings)
    },
    [dispatch, ascension, talent]
  )
  const setLevel = useCallback(
    (level = 1) => {
      level = clamp(level, 1, useLow ? maxLevelLow : maxLevel)
      const ascension = ascensionMaxLevels.findIndex(
        (ascenML) => level <= ascenML
      ) as AscensionKey
      setLevelAndAscensionWithTalentClamp({ level, ascension })
    },
    [setLevelAndAscensionWithTalentClamp, ascensionMaxLevels, useLow]
  )
  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevels.findIndex(
      (ascenML) => level !== 90 && level === ascenML
    ) as AscensionKey
    if (ascension === lowerAscension)
      setLevelAndAscensionWithTalentClamp({
        ascension: (ascension + 1) as AscensionKey,
      })
    else setLevelAndAscensionWithTalentClamp({ ascension: lowerAscension })
  }, [
    setLevelAndAscensionWithTalentClamp,
    ascensionMaxLevels,
    ascension,
    level,
  ])
  return (
    <ButtonGroup sx={{ bgcolor: (t) => t.palette.contentNormal.main }}>
      <CustomNumberInputButtonGroupWrapper>
        <CustomNumberInput
          onChange={setLevel}
          value={level}
          startAdornment="Lv. "
          disabled={disabled}
          inputProps={{
            min: 1,
            max: 90,
            sx: { textAlign: 'center', width: '3em' },
          }}
          sx={{ height: '100%', pl: 2 }}
        />
      </CustomNumberInputButtonGroupWrapper>
      <Button
        sx={{ pl: 1, whiteSpace: 'nowrap' }}
        disabled={
          !(useLow ? ambiguousLevelLow : ambiguousLevel)(level) || disabled
        }
        onClick={setAscension}
      >
        <strong>/ {ascensionMaxLevel[ascension]}</strong>
      </Button>
      <DropdownButton
        title={t('selectlevel')}
        sx={{ flexGrow: 1 }}
        disabled={disabled}
      >
        {[...(useLow ? milestoneLevelsLow : milestoneLevels)].map(
          ([lv, as]) => {
            const selected = lv === level && as === ascension
            return (
              <MenuItem
                key={`${lv}/${as}`}
                selected={selected}
                disabled={selected}
                onClick={() =>
                  setLevelAndAscensionWithTalentClamp({
                    level: lv,
                    ascension: as,
                  })
                }
              >
                {lv === ascensionMaxLevels[as]
                  ? `Lv. ${lv}`
                  : `Lv. ${lv}/${ascensionMaxLevels[as]}`}
              </MenuItem>
            )
          }
        )}
      </DropdownButton>
    </ButtonGroup>
  )
}
