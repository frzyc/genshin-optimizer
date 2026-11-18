// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BuildCard } from './BuildCard'

// Tooltips are rendered on the wrapper around each footer button, in order:
// edit, copyTc, duplicate, equip, delete
function hoverAction(index: number) {
  const button = screen.getAllByRole('button')[index]
  fireEvent.mouseOver(button.parentElement!)
}

describe('BuildCard', () => {
  afterEach(cleanup)

  it('shows the disabled reason for an action without a handler', async () => {
    render(
      <BuildCard name="Build" disabledTips={{ edit: 'Cannot edit this' }}>
        content
      </BuildCard>
    )
    const editButton = screen.getAllByRole('button')[0]
    expect(editButton).toHaveProperty('disabled', true)
    hoverAction(0)
    expect(await screen.findByText('Cannot edit this')).toBeTruthy()
    expect(screen.queryByText('buildCardTip.edit')).toBeNull()
  })

  it('shows the regular tooltip for an enabled action', async () => {
    render(
      <BuildCard
        name="Build"
        onEdit={() => {}}
        disabledTips={{ edit: 'Cannot edit this' }}
      >
        content
      </BuildCard>
    )
    expect(screen.getAllByRole('button')[0]).toHaveProperty('disabled', false)
    hoverAction(0)
    expect(await screen.findByText('buildCardTip.edit')).toBeTruthy()
    expect(screen.queryByText('Cannot edit this')).toBeNull()
  })

  it('falls back to the regular tooltip when no disabled reason is given', async () => {
    render(<BuildCard name="Build">content</BuildCard>)
    expect(screen.getAllByRole('button')[4]).toHaveProperty('disabled', true)
    hoverAction(4)
    expect(await screen.findByText('buildCardTip.delete')).toBeTruthy()
  })
})
