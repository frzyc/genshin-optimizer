import {
  CharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import FemaleIcon from '@mui/icons-material/Female'
import MaleIcon from '@mui/icons-material/Male'
import { Button } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function TravelerGenderSelect() {
  const { t } = useTranslation('ui')
  const database = useDatabase()
  const { character } = useContext(CharacterContext)
  const { key } = character
  const { gender } = useDBMeta()
  const toggleGender = useCallback(
    () => database.dbMeta.set({ gender: gender === 'F' ? 'M' : 'F' }),
    [gender, database],
  )
  if (!key.startsWith('Traveler')) return null
  return (
    <Button
      onClick={toggleGender}
      startIcon={gender === 'F' ? <FemaleIcon /> : <MaleIcon />}
    >
      <strong>{t(`gender.${gender}`)}</strong>{' '}
    </Button>
  )
}
