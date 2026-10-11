// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
expect.extend({ /**
  * Test that the received value is within percentage error of the expected value
  * @param {number} received - The value of the new object
  * @param {number} expected - The expected value
  * @param {number} percentageMargin - The percentage margin
  */
  toApproximate(received, expected, percentageMargin = 3) {
    const percentageError = (received - expected) / expected * 100
    const receivedText = this.utils.printReceived(received)
    const percentText = this.utils.printReceived(percentageError.toFixed(2) + "%")
    const lowerBound = this.utils.printExpected(expected * (100 - percentageMargin) / 100)
    const upperBound = this.utils.printExpected(expected * (100 + percentageMargin) / 100)

    if (!isFinite(received)) return {
      pass: false, message: () => `expected ${receivedText} to be finite`
    }
    if (Math.abs(percentageError) > percentageMargin) return {
      pass: false, message: () => `expected ${receivedText} (${percentText}) to be between ${lowerBound} and ${upperBound}`,
    }

    return {
      pass: true, message: () => `expected ${receivedText} to be smaller than ${lowerBound} or larger than ${upperBound}`,
    }
  }
})

declare global {
  namespace jest {
    interface Matchers<R> {
      // TODO: Weird... this should already be declared
      toApproximate(formula: any, margin?: number): any
    }
  }
}
