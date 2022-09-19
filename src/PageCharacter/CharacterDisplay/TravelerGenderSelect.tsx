import { Female, Male } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterContext } from '../../Context/CharacterContext';
import { DatabaseContext } from '../../Database/Database';
import useGender from '../../ReactHooks/useGender';

export default function TravelerGenderSelect() {
  const { t } = useTranslation("ui")
  const { database } = useContext(DatabaseContext)
  const { character } = useContext(CharacterContext)
  const { key } = character
  const gender = useGender(database)
  const toggleGender = useCallback(() => database.states.set("dbMeta", { gender: gender === "F" ? "M" : "F" }), [gender, database])
  if (!(key.startsWith("Traveler"))) return null
  return <Button onClick={toggleGender} startIcon={gender === "F" ? <Female /> : <Male />}><strong>{t(`gender.${gender}`)}</strong>  </Button>
}
