import { Button } from '@mui/material';
import React, { Suspense, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ThumbSide from '../../Components/Character/ThumbSide';
import { CharacterContext } from '../../Context/CharacterContext';
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback';

const CharacterSelectionModal = React.lazy(() => import('../CharacterSelectionModal'))

export default function CharSelectDropdown() {
  const { t } = useTranslation("page_character")
  const { characterSheet } = useContext(CharacterContext)
  const [showModal, setshowModal] = useState(false)
  const setCharacter = useCharSelectionCallback()
  return <>
    <Suspense fallback={false}>
      <CharacterSelectionModal show={showModal} onHide={() => setshowModal(false)} onSelect={setCharacter} />
    </Suspense>
    <Button color="info" onClick={() => setshowModal(true)} startIcon={<ThumbSide src={characterSheet?.thumbImgSide} />} >{characterSheet?.name ?? t("selectCharacter")}</Button>
  </>
}
