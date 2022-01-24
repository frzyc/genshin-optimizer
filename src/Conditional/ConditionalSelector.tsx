import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Button, Divider, MenuItem } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import SqBadge from '../Components/SqBadge';
import { DataContext } from '../DataContext';
import IConditional from '../Types/IConditional_WR';
import { deepClone, layeredAssignment } from '../Util/Util';

export default function ConditionalSelector({ conditional, conditionalValue, disabled = false, }:
  { conditional: IConditional, conditionalValue?: string, disabled?: boolean }) {
  const { character, characterDispatch } = useContext(DataContext)
  const setConditional = useCallback((v?: string) => {
    const conditionalValues = deepClone(character.conditional)
    layeredAssignment(conditionalValues, conditional.path, v)
    characterDispatch({ conditional: conditionalValues })
  }, [conditional, character, characterDispatch])

  if (Object.keys(conditional.states).length === 1) {
    const [stateKey, st] = Object.entries(conditional.states)[0]
    const badge = st.name && <SqBadge color={"success"}>{st.name}</SqBadge>
    return <Button fullWidth size="small" onClick={() => setConditional(conditionalValue ? undefined : stateKey)} disabled={disabled} startIcon={conditionalValue ? <CheckBox /> : <CheckBoxOutlineBlank />}>
      {conditional.name} {badge}
    </Button>
  } else {//complex conditional
    const state = conditionalValue ? conditional.states[conditionalValue] : undefined
    const badge = state?.name && <SqBadge color={state ? "success" : "secondary"}>{state ? state.name : "Not Active"}</SqBadge>
    return <DropdownButton fullWidth size="small" title={<span>{conditional.name} {badge}</span>} disabled={disabled}>
      <MenuItem onClick={() => setConditional()} selected={!state} disabled={!state}>
        <span>Not Active</span>
      </MenuItem>
      <Divider />
      {Object.entries(conditional.states).map(([stateKey, st]) =>
        <MenuItem key={stateKey} onClick={() => setConditional(stateKey)} selected={conditionalValue === stateKey} disabled={conditionalValue === stateKey} >{st.name}</MenuItem>)}
    </DropdownButton>
  }
}
