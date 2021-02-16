import { fireEvent, render } from "@testing-library/react";
import CustomFormControl from "./CustomFormControl";

describe("Testing CustomFormControl Component", () => {

  describe('Int Input', () => {
    let displayValue, onValueChange, utils, input
    beforeEach(() => {
      displayValue = 999
      onValueChange = (v) => displayValue = v
      utils = render(<CustomFormControl value={displayValue} onValueChange={onValueChange} />)
      input = utils.getByLabelText('custom-input')
    })
    test('should Take basic Int', () => {
      fireEvent.change(input, { target: { value: 23 } })
      expect(displayValue).toBe(23)
    })
    test('should Parse Float', () => {
      fireEvent.change(input, { target: { value: 23.45 } })
      expect(displayValue).toBe(23)
    })
    test('should handle empty as zero by default', () => {
      fireEvent.change(input, { target: { value: "" } })
      expect(displayValue).toBe(0)
    })

  })
  describe('allowEmpty', () => {
    test('should handle empty', () => {
      let displayValue = 999
      const onValueChange = (v) => displayValue = v
      const utils = render(<CustomFormControl value={displayValue} onValueChange={onValueChange} allowEmpty={true} />)
      const input = utils.getByLabelText('custom-input')
      fireEvent.change(input, { target: { value: "" } })
      expect(displayValue).toBe(null)
    })
  })
  describe('Int Input', () => {
    let displayValue, onValueChange, utils, input
    beforeEach(() => {
      displayValue = 999.99
      onValueChange = (v) => displayValue = v
      utils = render(<CustomFormControl value={displayValue} onValueChange={onValueChange} float={true} />)
      input = utils.getByLabelText('custom-input')
    })
    test('should Take basic float', () => {
      fireEvent.change(input, { target: { value: 23 } })
      expect(displayValue).toBe(23)
    })
    test('should Parse Float', () => {
      fireEvent.change(input, { target: { value: 23.45 } })
      expect(displayValue).toBe(23.45)
    })
    test('should handle empty as zero by default', () => {
      fireEvent.change(input, { target: { value: "" } })
      expect(displayValue).toBe(0)
    })
  })
})