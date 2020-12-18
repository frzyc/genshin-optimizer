import { faUndo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap"
import { FloatFormControl, IntFormControl } from "../Components/CustomFormControl"

function StatInput(props) {
  let { value, placeholder, defaultValue, onValueChange, percent, ...restProps } = props
  return (<InputGroup {...restProps}>
    <InputGroup.Prepend>
      <InputGroup.Text>{props.name}</InputGroup.Text>
    </InputGroup.Prepend>
    {percent ?
      <FloatFormControl
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
      /> : <IntFormControl
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
      />}
    {percent ? (<InputGroup.Append>
      <InputGroup.Text>%</InputGroup.Text>
    </InputGroup.Append>) : null}
    {defaultValue !== undefined ? <InputGroup.Append>
      <OverlayTrigger placement="top"
        overlay={<Tooltip>Reset this override to the default value.</Tooltip>}>
        <span className="d-inline-block">
          <Button onClick={() => onValueChange(defaultValue)} disabled={value === defaultValue} style={value === defaultValue ? { pointerEvents: 'none' } : {}}>
            <FontAwesomeIcon icon={faUndo} />
          </Button>
        </span>
      </OverlayTrigger>
    </InputGroup.Append> : null}
  </InputGroup>)
}
export default StatInput