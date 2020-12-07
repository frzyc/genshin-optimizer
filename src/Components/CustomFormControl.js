import React from 'react'
import { FormControl } from 'react-bootstrap'

class FloatFormControl extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      periodEnd: false,
    }
  }
  validateInput = (e) => {
    let value = e.target.value;
    let periodEnd = value[value.length - 1] === ".";
    value = parseFloat(value)
    if (!isNaN(value)) this.setState({ periodEnd: periodEnd })
    value = value ? value : 0
    this.props.onValueChange && this.props.onValueChange(value);
  }
  render = () => {
    let props = { ...this.props }
    props.value = this.props.value ? (this.props.value + (this.state.periodEnd ? "." : "")) : "";
    delete props.onValueChange
    return <FormControl {...props}
      onChange={(e) => this.validateInput(e)}
    />
  }
}
class IntFormControl extends React.Component {
  validateInput = (e) => {
    let value = e.target.value;
    value = parseInt(value)
    value = value ? value : 0
    this.props.onValueChange && this.props.onValueChange(value);
  }
  render = () => {
    let props = { ...this.props }
    delete props.onValueChange
    return <FormControl {...props}
      onChange={(e) => this.validateInput(e)}
    />
  }
}
export {
  FloatFormControl,
  IntFormControl
}