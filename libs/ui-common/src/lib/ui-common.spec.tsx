import { render } from '@testing-library/react'

import UiCommon from './ui-common'

describe('UiCommon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiCommon />)
    expect(baseElement).toBeTruthy()
  })
})
