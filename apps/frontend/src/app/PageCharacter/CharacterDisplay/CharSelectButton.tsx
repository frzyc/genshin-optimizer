import { Button } from '@mui/material'
import React, { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CharIconSide from '../../Components/Image/CharIconSide'
import { CharacterContext } from '../../Context/CharacterContext'
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback'

const CharacterSelectionModal = React.lazy(
  () => import('../CharacterSelectionModal')
)

export default function CharSelectButton() {
  const { t } = useTranslation('page_character')
  const {
    characterSheet,
    character: { key: characterKey },
  } = useContext(CharacterContext)
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
