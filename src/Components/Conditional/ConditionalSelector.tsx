import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Button, Divider, MenuItem } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { DataContext } from '../../DataContext';
import { IDocumentConditional } from '../../Types/sheet';
import { deepClone, deletePropPath, layeredAssignment } from '../../Util/Util';
import DropdownButton from '../DropdownMenu/DropdownButton';
import SqBadge from '../SqBadge';
import { Translate } from '../Translate';

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

  // Use colored badges instead of colored text inside these buttons
  let condName = conditional.name
  if (conditional.name && isElement(conditional.name)) {
    const key = conditional.name.props.key18
    const ns = conditional.name.props.ns
    const values = conditional.name.props.values
    condName = <Translate ns={ns} key18={key} values={values} useBadge />
  }

  if (Object.keys(conditional.states).length === 1) {
    const [stateKey, st] = Object.entries(conditional.states)[0]
    const badge = getStateBadge(st.name)
    return <Button fullWidth size="small" color={conditionalValue ? "success" : "primary"} onClick={() => setConditional(conditionalValue ? undefined : stateKey)} disabled={disabled} startIcon={conditionalValue ? <CheckBox /> : <CheckBoxOutlineBlank />}>
      {condName} {badge}
    </Button>
  } else {//complex conditional
    const state = conditionalValue ? conditional.states[conditionalValue] : undefined
    const badge = state ? getStateBadge(state.name) : <SqBadge color="secondary">Not Active</SqBadge>
    return <DropdownButton fullWidth size="small" color={conditionalValue ? "success" : "primary"} title={<span>{condName} {badge}</span>} disabled={disabled}>
      <MenuItem onClick={() => setConditional()} selected={!state} disabled={!state}>
        <span>Not Active</span>
      </MenuItem>
      <Divider />
      {Object.entries(conditional.states).map(([stateKey, st]) =>
        <MenuItem key={stateKey} onClick={() => setConditional(stateKey)} selected={conditionalValue === stateKey} disabled={conditionalValue === stateKey} >{st.name}</MenuItem>)}
    </DropdownButton>
  }
}

function isElement(disp: Displayable): disp is JSX.Element {
  return (typeof disp !== "string")
}

// Use colored badges instead of colored text inside these buttons
function getStateBadge(stateName?: Displayable): "" | JSX.Element {
  if (!stateName) return ""

  let badgeColor = "primary"
  let badgeText = stateName
  if (stateName && isElement(stateName)) {
    if (stateName.props.color) {
      badgeColor = stateName.props.color
      badgeText = <span>{stateName.props.children}</span>
    }
  }
  return <SqBadge sx={{ ml: 0.5 }} color={badgeColor}>{badgeText}</SqBadge>
}
