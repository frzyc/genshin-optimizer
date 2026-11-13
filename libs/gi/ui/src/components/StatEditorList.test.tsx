// @vitest-environment jsdom
import type { InputPremodKey } from '@genshin-optimizer/gi/wr-types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StatEditorList } from './StatEditorList'

const statKeys: InputPremodKey[] = ['atk', 'critRate_', 'hp']

describe('StatEditorList', () => {
  afterEach(cleanup)

  it('does not show toggles unless setDisabledStatKeys is provided', () => {
    render(
      <StatEditorList
        statKeys={statKeys}
        statFilters={{ atk: 100 }}
        setStatFilters={() => {}}
      />
    )
    expect(screen.queryByLabelText('statToggle.disable')).toBeNull()
    expect(screen.queryByLabelText('statToggle.enable')).toBeNull()
  })

  it('shows a toggle for each stat', () => {
    render(
      <StatEditorList
        statKeys={statKeys}
        statFilters={{ atk: 100, critRate_: 10 }}
        setStatFilters={() => {}}
        disabledStatKeys={['critRate_']}
        setDisabledStatKeys={() => {}}
      />
    )
    // One toggle per existing stat, none for the "new stat" row
    expect(screen.getAllByLabelText('statToggle.disable')).toHaveLength(1)
    expect(screen.getAllByLabelText('statToggle.enable')).toHaveLength(1)
  })

  it('disables an enabled stat', () => {
    const setDisabledStatKeys = vi.fn()
    render(
      <StatEditorList
        statKeys={statKeys}
        statFilters={{ atk: 100, critRate_: 10 }}
        setStatFilters={() => {}}
        disabledStatKeys={['critRate_']}
        setDisabledStatKeys={setDisabledStatKeys}
      />
    )
    fireEvent.click(screen.getByLabelText('statToggle.disable'))
    expect(setDisabledStatKeys).toHaveBeenCalledWith(['critRate_', 'atk'])
  })

  it('enables a disabled stat', () => {
    const setDisabledStatKeys = vi.fn()
    render(
      <StatEditorList
        statKeys={statKeys}
        statFilters={{ atk: 100, critRate_: 10 }}
        setStatFilters={() => {}}
        disabledStatKeys={['critRate_']}
        setDisabledStatKeys={setDisabledStatKeys}
      />
    )
    fireEvent.click(screen.getByLabelText('statToggle.enable'))
    expect(setDisabledStatKeys).toHaveBeenCalledWith([])
  })

  it('keeps a stat disabled when it is changed to another stat', () => {
    const calls: string[] = []
    const setStatFilters = vi.fn(() => calls.push('setStatFilters'))
    const setDisabledStatKeys = vi.fn(() => calls.push('setDisabledStatKeys'))
    render(
      <StatEditorList
        statKeys={statKeys}
        statFilters={{ atk: 100, critRate_: 10 }}
        setStatFilters={setStatFilters}
        disabledStatKeys={['critRate_']}
        setDisabledStatKeys={setDisabledStatKeys}
      />
    )
    // Rows are [atk, critRate_, new stat]
    const critRateInput = screen.getAllByRole('combobox')[1]
    fireEvent.keyDown(critRateInput, { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('option', { name: /^hp/ }))

    expect(setStatFilters).toHaveBeenCalledWith({ atk: 100, hp: 10 })
    expect(setDisabledStatKeys).toHaveBeenCalledWith(['hp'])
    // The new key has to exist before it can be disabled
    expect(calls).toEqual(['setStatFilters', 'setDisabledStatKeys'])
  })

  it('treats a missing disabledStatKeys as all stats enabled', () => {
    const setDisabledStatKeys = vi.fn()
    render(
      <StatEditorList
        statKeys={statKeys}
        statFilters={{ atk: 100 }}
        setStatFilters={() => {}}
        setDisabledStatKeys={setDisabledStatKeys}
      />
    )
    fireEvent.click(screen.getByLabelText('statToggle.disable'))
    expect(setDisabledStatKeys).toHaveBeenCalledWith(['atk'])
  })
})
