import { allElementKeys, TravelerKey } from '@genshin-optimizer/consts';
import { MenuItem } from '@mui/material';
import { useContext } from 'react';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import { CharacterContext } from '../../Context/CharacterContext';
import { st, stg } from '../../Data/SheetUtil';
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback';
import { travelerElements, TravelerToElement } from '../../Types/consts';

export default function TravelerElementSelect() {
  const { character } = useContext(CharacterContext)
  const { key } = character
  const setCharacter = useCharSelectionCallback()
  if (!(key.startsWith("Traveler"))) return null

  const elementKey = allElementKeys.find(e => key.toLowerCase().includes(e))
  if (!elementKey) return null

  return <DropdownButton color={elementKey} title={<strong>{stg(`element.${elementKey}`)}</strong>}>
    {travelerElements.map(eleKey =>
      <MenuItem key={eleKey} selected={elementKey === eleKey} disabled={elementKey === eleKey} onClick={() => setCharacter(TravelerToElement(key as TravelerKey, eleKey))}>
        <strong>{st(`coloredEle.${eleKey}`)}</strong></MenuItem>)}
  </DropdownButton>
}
