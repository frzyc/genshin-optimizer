import { MenuItem } from '@mui/material';
import { useContext } from 'react';
import ColorText from '../../Components/ColoredText';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import { CharacterContext } from '../../Context/CharacterContext';
import { sgt } from '../../Data/SheetUtil';

export default function TravelerElementSelect() {
  const { character, characterSheet, characterDispatch } = useContext(CharacterContext)
  const { elementKey = "anemo", } = character

  if (!("talents" in characterSheet.sheet)) return null

  return <DropdownButton color={elementKey} title={<strong>{sgt(`element.${elementKey}`)}</strong>}>
    {Object.keys(characterSheet.sheet.talents).map(eleKey =>
      <MenuItem key={eleKey} selected={elementKey === eleKey} disabled={elementKey === eleKey} onClick={() => characterDispatch({ elementKey: eleKey })}>
        <strong><ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText></strong></MenuItem>)}
  </DropdownButton>
}
