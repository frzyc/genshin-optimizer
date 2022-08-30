import { Button } from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterSelectionModal } from '../CharacterSelectionModal';
import ThumbSide from '../../Components/Character/ThumbSide';
import { CharacterContext } from '../../Context/CharacterContext';
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback';

export default function CharSelectDropdown() {
  const { t } = useTranslation("page_character")
  const { characterSheet } = useContext(CharacterContext)
  const [showModal, setshowModal] = useState(false)
  const setCharacter = useCharSelectionCallback()
  return <>
    <CharacterSelectionModal show={showModal} onHide={() => setshowModal(false)} onSelect={setCharacter} />
    <Button color="info" onClick={() => setshowModal(true)} startIcon={<ThumbSide src={characterSheet?.thumbImgSide} />} >{characterSheet?.name ?? t("selectCharacter")}</Button>
  </>
}
