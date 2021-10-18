import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Button, Divider, MenuItem } from '@mui/material';
import React from 'react';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import SqBadge from '../Components/SqBadge';
import IConditional, { IConditionalValue } from '../Types/IConditional';
import { ICalculatedStats } from '../Types/stats';
import { evalIfFunc } from '../Util/Util';

export default function ConditionalSelector({ conditional, conditionalValue, setConditional, name, disabled = false, stats }:
  { conditional: IConditional, conditionalValue: IConditionalValue, setConditional: (newCond: IConditionalValue) => void, name: Displayable, disabled?: boolean, stats: ICalculatedStats }) {
  const [conditionalNum = 0, conditionalStateKey] = conditionalValue
  if (!conditional) return name as JSX.Element
  if ("states" in conditional) {//complex conditional
    const state = conditionalStateKey ? conditional.states[conditionalStateKey] : Object.values(conditional.states)[0]
    const text = conditionalNum === 0 ? "Not Active" : <span>{state.name} {(evalIfFunc(state!.maxStack, stats) as number > 1 ? (`: ${conditionalNum} stack${conditionalNum > 1 ? "s" : ""}`) : "")}</span>
    const badge = <SqBadge color={conditionalNum === 0 ? "secondary" : "success"}>{text}</SqBadge>
    return <DropdownButton size="small" title={<span>{name} {badge}</span>} disabled={disabled}>
      <MenuItem onClick={() => setConditional([0])} selected={conditionalNum === 0} disabled={conditionalNum === 0}>
        <span>Not Active</span>
      </MenuItem>
      <Divider />
      {Object.entries(conditional.states).flatMap(([stateKey, condial]: any, i) =>
        [...Array(condial.maxStack).keys()].map(v => v + 1).map((stack, i) =>
          <MenuItem key={stateKey + i} onClick={() => setConditional([stack, stateKey])} selected={conditionalStateKey === stateKey && conditionalNum === stack} disabled={conditionalStateKey === stateKey && conditionalNum === stack} >
            {condial.name}{condial.maxStack > 1 ? `: ${stack} stack${stack > 1 ? "s" : ""}` : ""}
          </MenuItem>)
      )}
    </DropdownButton>
  } else {
    const maxStack = evalIfFunc(conditional!.maxStack, stats) as number
    if (maxStack > 1) {
      //stacking conditional
      const badge = <SqBadge color={conditionalNum === 0 ? "secondary" : "success"}>{conditionalNum > 0 ? `${conditionalNum} stack${conditionalNum > 1 ? "s" : ""}` : "Not Active"}</SqBadge>
      return <DropdownButton size="small" title={<span>{name} {badge}</span>} disabled={disabled}>
        <MenuItem onClick={() => setConditional([0])} selected={conditionalNum === 0} disabled={conditionalNum === 0}>
          <span>Not Active</span>
        </MenuItem>
        <Divider />
        {[...Array(maxStack).keys()].map(v => v + 1).map(stack =>
          <MenuItem key={stack} onClick={() => setConditional([stack])} selected={conditionalNum === stack} disabled={conditionalNum === stack}>
            {`${stack} stack${stack > 1 ? "s" : ""}`}
          </MenuItem>)}
      </DropdownButton>
    } else if (maxStack === 1) {//single boolean conditional
      return <Button size="small" onClick={() => setConditional([conditionalNum ? 0 : 1])} disabled={disabled} startIcon={conditionalNum ? <CheckBox /> : <CheckBoxOutlineBlank />}>
        {name}
      </Button>
    }
  }
  return null
}