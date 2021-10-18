import { Box } from '@mui/material';
import React, { lazy, useCallback, useState } from 'react';
import CharacterCard from '../../Character/CharacterCard';
import CloseButton from '../../Components/CloseButton';
import ModalWrapper from '../../Components/ModalWrapper';

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('../../Character/CharacterDisplayCard'))

export default function CharacterSelectionCard({ characterKey, disabled, selectCharacter }) {
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => !disabled && setOpen(true), [setOpen, disabled])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  return <Box>
    <CharacterCard characterKey={characterKey} onEdit={onOpen} />
    <ModalWrapper open={open} onClose={onClose} containerProps={{ maxWidth: "xl" }}>
      <CharacterDisplayCard
        characterKey={characterKey}
        setCharacterKey={selectCharacter}
        onClose={onClose}
        footer={<CloseButton large onClick={onClose} />} />
    </ModalWrapper>
  </Box>
}