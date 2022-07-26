import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Button, ButtonGroup, ButtonProps, Divider, MenuItem } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { CharacterContext } from '../../Context/CharacterContext';
import { DataContext } from '../../Context/DataContext';
import { DocumentConditional, IDocumentConditionalExclusive, IDocumentConditionalMultiple } from '../../Types/sheet';
import { deepClone, deletePropPath, layeredAssignment } from '../../Util/Util';
import DropdownButton from '../DropdownMenu/DropdownButton';
import SqBadge from '../SqBadge';
import { Translate } from '../Translate';

interface ConditionalSelectorProps {
  conditional: DocumentConditional,
  disabled?: boolean,
}
export default function ConditionalSelector({ conditional, disabled = false, }: ConditionalSelectorProps) {
  if (Object.keys(conditional.states).length === 1 && "path" in conditional) {
    return <SimpleConditionalSelector conditional={conditional} disabled={disabled} />
  } else if ("path" in conditional) {
    return <ExclusiveConditionalSelector conditional={conditional} disabled={disabled} />
  } else /*if ("path" in Object.entries(conditional.states)[0]) */ {
    return <MultipleConditionalSelector conditional={conditional} disabled={disabled} />
  }
}

interface SimpleConditionalSelectorProps extends ConditionalSelectorProps {
  conditional: IDocumentConditionalExclusive
}
function SimpleConditionalSelector({ conditional, disabled }: SimpleConditionalSelectorProps) {
  const { character, characterDispatch } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const setConditional = useCallback((v?: string) => {
    const conditionalValues = deepClone(character.conditional)
    if (v) {
      layeredAssignment(conditionalValues, conditional.path, v)
    } else {
      deletePropPath(conditionalValues, conditional.path)
    }
    characterDispatch({ conditional: conditionalValues })
  }, [conditional, character, characterDispatch])

  const conditionalValue = data.get(conditional.value).value
  const [stateKey, st] = Object.entries(conditional.states)[0]
  const badge = getStateBadge(st.name)
  const condName = getCondName(conditional.name)

  return <Button fullWidth size="small" sx={{ borderRadius: 0 }} color={conditionalValue ? "success" : "primary"} onClick={() => setConditional(conditionalValue ? undefined : stateKey)} disabled={disabled} startIcon={conditionalValue ? <CheckBox /> : <CheckBoxOutlineBlank />}>
    {condName} {badge}
  </Button>
}

interface ExclusiveConditionalSelectorProps extends ConditionalSelectorProps {
  conditional: IDocumentConditionalExclusive
}
function ExclusiveConditionalSelector({ conditional, disabled }: ExclusiveConditionalSelectorProps) {
  const { character, characterDispatch } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const setConditional = useCallback((v?: string) => {
    const conditionalValues = deepClone(character.conditional)
    if (v) {
      layeredAssignment(conditionalValues, conditional.path, v)
    } else {
      deletePropPath(conditionalValues, conditional.path)
    }
    characterDispatch({ conditional: conditionalValues })
  }, [conditional, character, characterDispatch])

  const conditionalValue = data.get(conditional.value).value
  const state = conditionalValue ? conditional.states[conditionalValue] : undefined
  const badge = state ? getStateBadge(state.name) : <SqBadge color="secondary">Not Active</SqBadge>
  const condName = getCondName(conditional.name)

  return <DropdownButton fullWidth size="small" sx={{ borderRadius: 0 }} color={conditionalValue ? "success" : "primary"} title={<span>{condName} {badge}</span>} disabled={disabled}>
    <MenuItem onClick={() => setConditional()} selected={!state} disabled={!state}>
      <span>Not Active</span>
    </MenuItem>
    <Divider />
    {Object.entries(conditional.states).map(([stateKey, st]) =>
      <MenuItem key={stateKey} onClick={() => setConditional(stateKey)} selected={conditionalValue === stateKey} disabled={conditionalValue === stateKey} >{st.name}</MenuItem>)}
  </DropdownButton>
}

interface MultipleConditionalSelectorProps extends ConditionalSelectorProps {
  conditional: IDocumentConditionalMultiple
}
function MultipleConditionalSelector({ conditional, disabled }: MultipleConditionalSelectorProps) {
  const { character, characterDispatch } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const setConditional = useCallback((path: readonly string[], v?: string) => {
    const conditionalValues = deepClone(character.conditional)
    if (v) {
      layeredAssignment(conditionalValues, path, v)
    } else {
      deletePropPath(conditionalValues, path)
    }
    characterDispatch({ conditional: conditionalValues })
  }, [character, characterDispatch])

  return <ButtonGroup fullWidth orientation="vertical" disableElevation color="secondary" >
    {Object.entries(conditional.states).map(([stateKey, st]) => {
      const conditionalValue = data.get(st.value).value
      const isSelected = conditionalValue === stateKey
      return <Button
        color={isSelected ? "success" : "primary"}
        disabled={disabled}
        fullWidth
        key={stateKey}
        onClick={() => setConditional(st.path, conditionalValue ? undefined : stateKey)}
        size="small"
        startIcon={isSelected ? <CheckBox /> : <CheckBoxOutlineBlank />}
        sx={{ borderRadius: 0 }}
      >
        {getCondName(st.name)}
      </Button>
    })}
  </ButtonGroup>
}

function isElement(disp: Displayable): disp is JSX.Element {
  return (typeof disp !== "string")
}

// Use colored badges instead of colored text inside these buttons
function getStateBadge(stateName: Displayable | undefined): Displayable {
  if (!stateName) return ""

  let badgeColor: ButtonProps['color'] = "primary"
  let badgeText = stateName
  if (stateName && isElement(stateName)) {
    if (stateName.props.color) {
      badgeColor = stateName.props.color
      badgeText = <span>{stateName.props.children}</span>
    }
  }
  return <SqBadge sx={{ ml: 0.5 }} color={badgeColor}>{badgeText}</SqBadge>
}

// Use colored badges instead of colored text inside these buttons
function getCondName(condName: Displayable): Displayable {
  if (isElement(condName)) {
    const key = condName.props.key18
    const ns = condName.props.ns
    const values = condName.props.values
    return <Translate ns={ns} key18={key} values={values} useBadge />
  }
  return condName
}
