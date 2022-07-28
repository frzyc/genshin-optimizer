import { Button, ButtonGroup, MenuItem } from '@mui/material';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../../Components/CustomNumberInput';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import { CharacterContext } from '../../Context/CharacterContext';
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from '../../Data/LevelData';
import { clamp } from '../../Util/Util';

export default function LevelSelect() {
  const { t } = useTranslation("page_character")
  const { character, characterSheet, characterDispatch } = useContext(CharacterContext)
  const setLevel = useCallback((level) => {
    level = clamp(level, 1, 90)
    const ascension = ascensionMaxLevel.findIndex(ascenML => level <= ascenML)
    characterDispatch({ level, ascension })
  }, [characterDispatch])
  const setAscension = useCallback(() => {
    if (!character) return
    const { level = 1, ascension = 0 } = character
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) characterDispatch({ ascension: ascension + 1 })
    else characterDispatch({ ascension: lowerAscension })
  }, [characterDispatch, character])
  const { level = 1, ascension = 0 } = character
  return <ButtonGroup sx={{ bgcolor: t => t.palette.contentDark.main }} >
    <CustomNumberInputButtonGroupWrapper >
      <CustomNumberInput onChange={setLevel} value={level}
        startAdornment="Lv. "
        inputProps={{ min: 1, max: 90, sx: { textAlign: "center" } }}
        sx={{ width: "100%", height: "100%", pl: 2 }}
        disabled={!characterSheet} />
    </CustomNumberInputButtonGroupWrapper>
    <Button sx={{ pl: 1 }} disabled={!ambiguousLevel(level) || !characterSheet} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
    <DropdownButton title={t("selectLevel")} disabled={!characterSheet}>
      {milestoneLevels.map(([lv, as]) => {
        const sameLevel = lv === ascensionMaxLevel[as]
        const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
        const selected = lv === level && as === ascension
        return <MenuItem key={`${lv}/${as}`} selected={selected} disabled={selected} onClick={() => characterDispatch({ level: lv, ascension: as })}>{lvlstr}</MenuItem>
      })}
    </DropdownButton>
  </ButtonGroup>
}
