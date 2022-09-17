import { MenuItem } from '@mui/material';
import { useContext } from 'react';
import ColorText from '../../Components/ColoredText';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import { CharacterContext } from '../../Context/CharacterContext';
import { sgt } from '../../Data/SheetUtil';
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback';
import { allElements, travelerElements, TravelerKey, TravelerToElement } from '../../Types/consts';

export default function TravelerElementSelect() {
  const { character } = useContext(CharacterContext)
  const { key } = character
  const setCharacter = useCharSelectionCallback()
  if (!(key.startsWith("Traveler"))) return null

  const elementKey = allElements.find(e => key.toLowerCase().includes(e))!

  return <DropdownButton color={elementKey} title={<strong>{sgt(`element.${elementKey}`)}</strong>}>
    {travelerElements.map(eleKey =>
      <MenuItem key={eleKey} selected={elementKey === eleKey} disabled={elementKey === eleKey} onClick={() => setCharacter(TravelerToElement(key as TravelerKey, eleKey))}>
        <strong><ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText></strong></MenuItem>)}
  </DropdownButton>
}
