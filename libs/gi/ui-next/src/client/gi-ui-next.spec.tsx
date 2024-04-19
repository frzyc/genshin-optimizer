import { render } from '@testing-library/react'

import GiUiNext from './gi-ui-next'

describe('GiUiNext', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GiUiNext />)
    expect(baseElement).toBeTruthy()
  })
})
