import { Button } from '@mui/material'
import React, { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CharIconSide from '../../Components/Image/CharIconSide'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback'

const CharacterSelectionModal = React.lazy(
  () => import('../../Components/Character/CharacterSelectionModal')
)

export default function CharSelectButton() {
  const { t } = useTranslation('page_character')
  const {
    characterSheet,
    character: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const [showModal, setshowModal] = useState(false)
  const setCharacter = useCharSelectionCallback()
  return (
    <>
      <Suspense fallback={false}>
        <CharacterSelectionModal
          show={showModal}
          onHide={() => setshowModal(false)}
          onSelect={setCharacter}
        />
      </Suspense>
      <Button
        color="info"
        onClick={() => setshowModal(true)}
        startIcon={<CharIconSide characterKey={characterKey} />}
      >
        {characterSheet?.name ?? t('selectCharacter')}
      </Button>
    </>
  )
}
