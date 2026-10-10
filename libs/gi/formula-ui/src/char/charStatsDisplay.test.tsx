import { CalcContext, TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { Tag } from '@genshin-optimizer/gi/formula'
import { theme } from '@genshin-optimizer/gi/theme'
import { ThemeProvider } from '@mui/material'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CharStatsDisplay } from './CharStatsDisplay'
import { GiSheetUiProviders } from './CharCalcProvider'
import { CHAR_UI_AUDIT_KEYS } from './charUiAudit'
import {
  buildOptimizePageCalc,
  listUnresolvedOptimizeCatalogLabels,
} from './optimizeTestHarness'

vi.mock('@genshin-optimizer/common/util', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@genshin-optimizer/common/util')>()
  return {
    ...actual,
    shouldShowDevComponents: true,
  }
})

vi.mock('../hooks/useOptCategoryCollapse', () => ({
  useOptCategoryCollapse: () => ({
    isCollapsed: () => false,
    toggleCollapsed: () => {},
  }),
  optPanelSectionKeys: ['stats', 'other'],
}))

function OptimizePageHarness({
  characterKey,
  children,
}: {
  characterKey: (typeof CHAR_UI_AUDIT_KEYS)[number]
  children: ReactNode
}) {
  const calc = buildOptimizePageCalc(characterKey)
  const formulaTextCache = new Map()
  return (
    <ThemeProvider theme={theme}>
      <GiSheetUiProviders formulaTextCache={formulaTextCache}>
        <CalcContext.Provider value={calc}>
          <TagContext.Provider value={{ src: '0' } as Tag}>
            {children}
          </TagContext.Provider>
        </CalcContext.Provider>
      </GiSheetUiProviders>
    </ThemeProvider>
  )
}

describe('CharStatsDisplay optimize panel', () => {
  it.each(
    CHAR_UI_AUDIT_KEYS
  )('%s renders catalog rows without unresolved tag labels', (characterKey) => {
    const calc = buildOptimizePageCalc(characterKey)
    const unresolved = listUnresolvedOptimizeCatalogLabels(characterKey, calc)
    expect(
      unresolved.map(({ name, label }) => `${name} (${label})`),
      `${characterKey} optimize catalog labels`
    ).toEqual([])
    render(
      <OptimizePageHarness characterKey={characterKey}>
        <CharStatsDisplay characterKey={characterKey} />
      </OptimizePageHarness>
    )
  })
})
