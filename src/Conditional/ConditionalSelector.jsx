import { faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'

export default function ConditionalSelector({ conditional, conditionalValue, setConditional, name, disabled }) {
  const [conditionalNum=0, conditionalStateKey] = conditionalValue
  if (!conditional) return name
  if (conditional.states) {//complex conditional 
    const state = conditional.states[conditionalStateKey] ?? {}
    const text = conditionalNum === 0 ? "Not Active" : <span>{state.name} {(state.maxStack > 1 ? (`: ${conditionalNum} stack${conditionalNum > 1 ? "s" : ""}`) : "")}</span>
    const badge = <Badge variant={conditionalNum === 0 ? "secondary" : "success"}>{text}</Badge>
    return <Dropdown>
      <Dropdown.Toggle size="sm" disabled={disabled}>
        <h6 className="mb-0 d-inline" style={{ whiteSpace: "normal" }}>{name} {badge}</h6>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setConditional([0])}>
          <span>Not Active</span>
        </Dropdown.Item>
        {Object.entries(conditional.states).map(([stateKey, condial], i) =>
          <React.Fragment key={i}>
            {[...Array(condial.maxStack).keys()].map(v => v + 1).map((stack, i) =>
              <Dropdown.Item key={stateKey + i} onClick={() => setConditional([stack, stateKey])}>
                {condial.name}{condial.maxStack > 1 ? `: ${stack} stack${stack > 1 ? "s" : ""}` : ""}
              </Dropdown.Item>)}
          </React.Fragment>
        )}
      </Dropdown.Menu>
    </Dropdown>
  } else if (conditional.maxStack > 1) {
    //stacking conditional
    const badge = <Badge variant={conditionalNum === 0 ? "secondary" : "success"}>{conditionalNum > 0 ? `${conditionalNum} stack${conditionalNum > 1 ? "s" : ""}` : "Not Active"}</Badge>
    return <Dropdown>
      <Dropdown.Toggle size="sm" disabled={disabled}>
        <h6 className="mb-0 d-inline" style={{ whiteSpace: "normal" }}>{name} {badge}</h6>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setConditional([0])}>
          <span>Not Active</span>
        </Dropdown.Item>
        {[...Array(conditional.maxStack).keys()].map(v => v + 1).map(stack =>
          <Dropdown.Item key={stack} onClick={() => setConditional([stack])}>
            {`${stack} stack${stack > 1 ? "s" : ""}`}
          </Dropdown.Item>)}
      </Dropdown.Menu>
    </Dropdown>
  } else if (conditional.maxStack === 1) {//single boolean conditional
    return <Button size="sm" onClick={() => setConditional([conditionalNum ? 0 : 1])} disabled={disabled}>
      <h6 className="mb-0"><FontAwesomeIcon icon={conditionalNum ? faCheckSquare : faSquare} /> {name}</h6>
    </Button>
  }
}