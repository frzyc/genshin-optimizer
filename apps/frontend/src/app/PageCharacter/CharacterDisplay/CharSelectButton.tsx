import { Button } from '@mui/material'
import React, { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { characterAsset } from '@genshin-optimizer/g-assets'
import ThumbSide from '../../Components/Character/ThumbSide'
import { CharacterContext } from '../../Context/CharacterContext'
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback'
import useDBMeta from '../../ReactHooks/useDBMeta'

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
  const { gender } = useDBMeta()
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
        startIcon={
          <ThumbSide src={characterAsset(characterKey, 'iconSide', gender)} />
        }
      >
        {characterSheet?.name ?? t('selectCharacter')}
      </Button>
    </>
  )
}
