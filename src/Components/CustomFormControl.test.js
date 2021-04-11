import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomFormControl from "./CustomFormControl";

describe("Testing CustomFormControl Component", () => {
  let displayValue, utils, input
  const onChangeMock = jest.fn(v => v)
  describe('Basic Interactions, Int', () => {
    beforeEach(() => {
      displayValue = null
      utils = render(<CustomFormControl value={displayValue} onChange={onChangeMock} />)
      input = utils.getByLabelText('custom-input')
    })
    test('should basic input', () => {
      userEvent.type(input, "12")
      input.blur()
      expect(onChangeMock.mock.calls.length).toBe(1)
      expect(onChangeMock.mock.calls[0][0]).toBe(12)//1st call 1st arg
    })
    test('should Use Enter key to finalize', () => {
      userEvent.type(input, "3{enter}")
      expect(onChangeMock.mock.calls[0][0]).toBe(3)//1st call 1st arg
    })
    test('empty by backspacing', () => {
      userEvent.type(input, "{enter}")
      expect(onChangeMock.mock.calls[0][0]).toBe(0)//1st call 1st arg
    })
    test('should parse float to int', () => {
      userEvent.type(input, "12.345")
      input.blur()
      expect(onChangeMock.mock.calls[0][0]).toBe(12)//1st call 1st arg
    })
  })

  describe('Basic Interactions, float', () => {
    beforeEach(() => {
      displayValue = null
      utils = render(<CustomFormControl value={displayValue} onChange={onChangeMock} float />)
      input = utils.getByLabelText('custom-input')
    })
    test('should parse float', () => {
      userEvent.type(input, "12.345")
      input.blur()
      expect(onChangeMock.mock.calls[0][0]).toBe(12.345)//1st call 1st arg
    })
  })
  describe('allowEmpty', () => {
    beforeEach(() => {
      displayValue = null
      utils = render(<CustomFormControl value={displayValue} onChange={onChangeMock} allowEmpty />)
      input = utils.getByLabelText('custom-input')
    })
    test('should allowEMpty', () => {
      userEvent.type(input, "{enter}")
      expect(onChangeMock.mock.calls[0][0]).toBe(null)//1st call 1st arg
    })
  })
})