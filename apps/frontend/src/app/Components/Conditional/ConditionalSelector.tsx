import {
  deepClone,
  deletePropPath,
  evalIfFunc,
  layeredAssignment,
} from '@genshin-optimizer/common/util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import type { ButtonProps } from '@mui/material'
import { Button, ButtonGroup, Divider, MenuItem } from '@mui/material'
import { useCallback, useContext } from 'react'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
import { DataContext } from '../../Context/DataContext'
import type {
  DocumentConditional,
  IDocumentConditionalExclusive,
  IDocumentConditionalMultiple,
} from '../../Types/sheet'
import DropdownButton from '../DropdownMenu/DropdownButton'
import SqBadge from '../SqBadge'
import { Translate } from '../Translate'

interface ConditionalSelectorProps {
  conditional: DocumentConditional
  disabled?: boolean
}
export default function ConditionalSelector({
  conditional,
  disabled = false,
}: ConditionalSelectorProps) {
  const { data } = useContext(DataContext)
  if (
    Object.keys(evalIfFunc(conditional.states, data)).length === 1 &&
    'path' in conditional
  ) {
    return (
      <SimpleConditionalSelector
        conditional={conditional}
        disabled={disabled}
      />
    )
  } else if ('path' in conditional) {
    return (
      <ExclusiveConditionalSelector
        conditional={conditional}
        disabled={disabled}
      />
    )
  } /*if ("path" in Object.entries(conditional.states)[0]) */ else {
    return (
      <MultipleConditionalSelector
        conditional={conditional}
        disabled={disabled}
      />
    )
  }
}

interface SimpleConditionalSelectorProps extends ConditionalSelectorProps {
  conditional: IDocumentConditionalExclusive
}
function SimpleConditionalSelector({
  conditional,
  disabled,
}: SimpleConditionalSelectorProps) {
  const { teamCharId } = useContext(TeamCharacterContext)
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const setConditional = useCallback(
    (v?: string) => {
      database.teamChars.set(teamCharId, (teamChar) => {
        const conditionalValues = deepClone(teamChar.conditional)
        if (v) {
          layeredAssignment(conditionalValues, conditional.path, v)
        } else {
          deletePropPath(conditionalValues, conditional.path)
        }
        teamChar.conditional = conditionalValues
      })
    },
    [database, conditional.path, teamCharId]
  )

  const conditionalValue = data.get(conditional.value).value
  const [stateKey, st] = Object.entries(evalIfFunc(conditional.states, data))[0]
  const badge = getStateBadge(st.name)
  const condName = getCondName(conditional.name)

  return (
    <Button
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={conditionalValue ? 'success' : 'primary'}
      onClick={() => setConditional(conditionalValue ? undefined : stateKey)}
      disabled={disabled}
      startIcon={conditionalValue ? <CheckBox /> : <CheckBoxOutlineBlank />}
    >
      {condName} {badge}
    </Button>
  )
}

interface ExclusiveConditionalSelectorProps extends ConditionalSelectorProps {
  conditional: IDocumentConditionalExclusive
}
function ExclusiveConditionalSelector({
  conditional,
  disabled,
}: ExclusiveConditionalSelectorProps) {
  const { teamCharId } = useContext(TeamCharacterContext)
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const setConditional = useCallback(
    (v?: string) => {
      database.teamChars.set(teamCharId, (teamChar) => {
        const conditionalValues = deepClone(teamChar.conditional)
        if (v) {
          layeredAssignment(conditionalValues, conditional.path, v)
        } else {
          deletePropPath(conditionalValues, conditional.path)
        }
        teamChar.conditional = conditionalValues
      })
    },
    [database, conditional.path, teamCharId]
  )

  const conditionalValue = data.get(conditional.value).value
  const condStates = evalIfFunc(conditional.states, data)
  const state = conditionalValue ? condStates[conditionalValue] : undefined
  const badge = state ? (
    getStateBadge(state.name)
  ) : (
    <SqBadge color="secondary">Not Active</SqBadge>
  )
  const condName = getCondName(conditional.name)

  return (
    <DropdownButton
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={conditionalValue && state ? 'success' : 'primary'}
      title={
        <span>
          {condName} {badge}
        </span>
      }
      disabled={disabled}
    >
      <MenuItem
        onClick={() => setConditional()}
        selected={!state}
        disabled={!state}
      >
        <span>Not Active</span>
      </MenuItem>
      <Divider />
      {Object.entries(condStates).map(([stateKey, st]) => (
        <MenuItem
          key={stateKey}
          onClick={() => setConditional(stateKey)}
          selected={conditionalValue === stateKey}
          disabled={conditionalValue === stateKey}
        >
          {st.name}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

interface MultipleConditionalSelectorProps extends ConditionalSelectorProps {
  conditional: IDocumentConditionalMultiple
}
function MultipleConditionalSelector({
  conditional,
  disabled,
}: MultipleConditionalSelectorProps) {
  const { teamCharId } = useContext(TeamCharacterContext)
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const setConditional = useCallback(
    (path: readonly string[], v?: string) => {
      database.teamChars.set(teamCharId, (teamChar) => {
        const conditionalValues = deepClone(teamChar.conditional)
        if (v) {
          layeredAssignment(conditionalValues, path, v)
        } else {
          deletePropPath(conditionalValues, path)
        }
        teamChar.conditional = conditionalValues
      })
    },
    [database, teamCharId]
  )

  return (
    <ButtonGroup
      fullWidth
      orientation="vertical"
      disableElevation
      color="secondary"
    >
      {Object.entries(evalIfFunc(conditional.states, data)).map(
        ([stateKey, st]) => {
          const conditionalValue = data.get(st.value).value
          const isSelected = conditionalValue === stateKey
          return (
            <Button
              color={isSelected ? 'success' : 'primary'}
              disabled={disabled}
              fullWidth
              key={stateKey}
              onClick={() =>
                setConditional(st.path, conditionalValue ? undefined : stateKey)
              }
              size="small"
              startIcon={isSelected ? <CheckBox /> : <CheckBoxOutlineBlank />}
              sx={{ borderRadius: 0 }}
            >
              {getCondName(st.name)}
            </Button>
          )
        }
      )}
    </ButtonGroup>
  )
}

function isElement(disp: Displayable): disp is JSX.Element {
  return typeof disp !== 'string'
}

// Use colored badges instead of colored text inside these buttons
function getStateBadge(stateName: Displayable | undefined): Displayable {
  if (!stateName) return ''

  let badgeColor: ButtonProps['color'] = 'primary'
  let badgeText = stateName
  if (stateName && isElement(stateName)) {
    if (stateName.props.color) {
      badgeColor = stateName.props.color
      badgeText = <span>{stateName.props.children}</span>
    }
  }
  return (
    <SqBadge sx={{ ml: 0.5 }} color={badgeColor}>
      {badgeText}
    </SqBadge>
  )
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
