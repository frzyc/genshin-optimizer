import { faUndo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Button from "react-bootstrap/Button"
import InputGroup from "react-bootstrap/InputGroup"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import CustomFormControl from "../Components/CustomFormControl"

type StatInputInput = {
  name: Displayable,
  prependEle?: Displayable,
  value: number,
  placeholder?: string,
  defaultValue?: number,
  onValueChange: (newValue: number | undefined) => void,
  percent?: boolean,
  disabled?: boolean,
  className?: any,
}

const StatInput = ({ name, prependEle, value, placeholder, defaultValue = 0, onValueChange, percent = false, disabled = false, ...restProps }: StatInputInput) =>
  <InputGroup {...restProps}>
    {prependEle ? <InputGroup.Prepend>{prependEle}</InputGroup.Prepend> : null}
    <InputGroup.Prepend>
      <InputGroup.Text>{name}</InputGroup.Text>
    </InputGroup.Prepend>
    <CustomFormControl
      float={percent}
      placeholder={placeholder}
      value={value}
      onChange={onValueChange}
      disabled={disabled}
    />
    <InputGroup.Append>
      {Boolean(percent) && <InputGroup.Text>%</InputGroup.Text>}
      {defaultValue !== undefined && <OverlayTrigger placement="top"
        overlay={<Tooltip id="reset-tooltip">Reset this override to the default value.</Tooltip>}>
        <span className="d-inline-block">
          <Button onClick={() => onValueChange(defaultValue)} disabled={disabled || value === defaultValue} style={value === defaultValue ? { pointerEvents: 'none' } : {}}>
            <FontAwesomeIcon icon={faUndo} />
          </Button>
        </span>
      </OverlayTrigger>}
    </InputGroup.Append>
  </InputGroup>
export default StatInput