import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Button, Divider, MenuItem } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { DataContext } from '../../DataContext';
import { IDocumentConditional } from '../../Types/sheet';
import { deepClone, deletePropPath, layeredAssignment } from '../../Util/Util';
import DropdownButton from '../DropdownMenu/DropdownButton';
import SqBadge from '../SqBadge';

export default function ConditionalSelector({ conditional, conditionalValue, disabled = false, }:
  { conditional: IDocumentConditional, conditionalValue?: string, disabled?: boolean }) {
  const { character, characterDispatch } = useContext(DataContext)
  const setConditional = useCallback((v?: string) => {
    const conditionalValues = deepClone(character.conditional)
    if (v) {
      layeredAssignment(conditionalValues, conditional.path, v)
    } else {
      deletePropPath(conditionalValues, conditional.path)
    }
    characterDispatch({ conditional: conditionalValues })
  }, [conditional, character, characterDispatch])

  if (Object.keys(conditional.states).length === 1) {
    const [stateKey, st] = Object.entries(conditional.states)[0]
    const badge = st.name && <SqBadge>{st.name}</SqBadge>
    return <Button fullWidth size="small" color={conditionalValue ? "success" : "primary"} onClick={() => setConditional(conditionalValue ? undefined : stateKey)} disabled={disabled} startIcon={conditionalValue ? <CheckBox /> : <CheckBoxOutlineBlank />}>
      {conditional.name} {badge}
    </Button>
  } else {//complex conditional
    const state = conditionalValue ? conditional.states[conditionalValue] : undefined
    const badge = state?.name && <SqBadge color={state ? "primary" : "secondary"}>{state ? state.name : "Not Active"}</SqBadge>
    return <DropdownButton fullWidth size="small" color={conditionalValue ? "success" : "primary"} title={<span>{conditional.name} {badge}</span>} disabled={disabled}>
      <MenuItem onClick={() => setConditional()} selected={!state} disabled={!state}>
        <span>Not Active</span>
      </MenuItem>
      <Divider />
      {Object.entries(conditional.states).map(([stateKey, st]) =>
        <MenuItem key={stateKey} onClick={() => setConditional(stateKey)} selected={conditionalValue === stateKey} disabled={conditionalValue === stateKey} >{st.name}</MenuItem>)}
    </DropdownButton>
  }
}
