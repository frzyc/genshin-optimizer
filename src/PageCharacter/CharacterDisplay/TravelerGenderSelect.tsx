import { MenuItem } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import { CharacterContext } from '../../Context/CharacterContext';
import { DatabaseContext } from '../../Database/Database';
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback';
import { TravelerGender, TravelerKey } from '../../Types/consts';
const gKeys = ["F", "M"] as const
export default function TravelerGenderSelect() {
  const { t } = useTranslation("ui")
  const { database } = useContext(DatabaseContext)
  const { character } = useContext(CharacterContext)
  const { key } = character
  const setCharacter = useCharSelectionCallback()
  if (!(key.startsWith("Traveler"))) return null
  const gender = key[8]

  return <DropdownButton title={<strong>{t(`gender.${gender}`)}</strong>}>
    {gKeys.map(gk =>
      <MenuItem key={gk} selected={gender === gk} disabled={gender === gk} onClick={() => {
        database.chars.swapTravelerGender(gk)
        setCharacter(TravelerGender(key as TravelerKey, gk))
      }}>
        <strong>{t(`gender.${gk}`)}</strong></MenuItem>)}
  </DropdownButton>
}
