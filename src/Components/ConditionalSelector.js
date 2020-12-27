import { faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Badge, Button, Dropdown } from 'react-bootstrap';

export default function ConditionalSelector(props) {
  let { conditional, conditionalNum, setConditional, defEle, disabled } = props
  if (!conditional) return defEle
  if (Array.isArray(conditional)) {
    let selectedConditionalNum = conditionalNum
    let selectedConditional = null
    for (const curConditional of conditional) {
      if (selectedConditionalNum > curConditional.maxStack) selectedConditionalNum -= curConditional.maxStack
      else {
        selectedConditional = curConditional;
        break;
      }
    }
    if (!selectedConditional) {
      selectedConditionalNum = 0
      selectedConditional = conditional[0]
    }

    //multi conditional
    let text = selectedConditionalNum === 0 ? "Not Active" :
      (selectedConditional.condition + (selectedConditional.maxStack > 1 ? (`: ${selectedConditionalNum} stack${selectedConditionalNum > 1 ? "s" : ""}`) : ""))
    let badge = <Badge variant={selectedConditionalNum === 0 ? "secondary" : "success"}>{text}</Badge>
    let count = 0;
    return <Dropdown disabled={disabled}>
      <Dropdown.Toggle size="sm">
        <h6 className="mb-0 d-inline">{defEle} {badge}</h6>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setConditional(0)}>
          <span>Not Active</span>
        </Dropdown.Item>
        {conditional.map(condial =>
          <React.Fragment key={condial.condition}>{[...Array(condial.maxStack).keys()].map(v => v + 1).map(stack => {
            let tempcount = ++count
            return <Dropdown.Item key={tempcount} onClick={() => setConditional(tempcount)}>
              {condial.condition}{selectedConditional.maxStack > 1 ? `: ${stack} stack${stack > 1 ? "s" : ""}` : ""}
            </Dropdown.Item>
          })}</React.Fragment>
        )}
      </Dropdown.Menu>
    </Dropdown>
  } else if (conditional.maxStack > 1) {
    //stacking conditional
    let badge = <Badge variant={conditionalNum === 0 ? "secondary" : "success"}>{conditionalNum > 0 ? `${conditionalNum} stack${conditionalNum > 1 ? "s" : ""}` : "Not Active"}</Badge>
    return <Dropdown disabled={disabled}>
      <Dropdown.Toggle size="sm">
        <h6 className="mb-0 d-inline">{defEle} {badge}</h6>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setConditional(0)}>
          <span>Not Active</span>
        </Dropdown.Item>
        {[...Array(conditional.maxStack).keys()].map(v => v + 1).map(stack =>
          <Dropdown.Item key={stack} onClick={() => setConditional(stack)}>
            {`${stack} stack${stack > 1 ? "s" : ""}`}
          </Dropdown.Item>)}
      </Dropdown.Menu>
    </Dropdown>
  } else if (conditional.maxStack === 1) {
    //single boolean conditional
    return <Button size="sm" onClick={() => setConditional(conditionalNum ? 0 : 1)} disabled={disabled}>
      <h6 className="mb-0"><FontAwesomeIcon icon={conditionalNum ? faCheckSquare : faSquare} /> {defEle}</h6>
    </Button>
  }

}