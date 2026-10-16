import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  SectionNavContext,
  SectionNavProvider,
} from '../nav/SectionNavContext'
import type { OptimizeSectionId } from '../nav/optimizeSections'

export type OptimizeActions = {
  disabled: boolean
  optimizing: boolean
  onRun: () => void
  onCancel: () => void
}

type OptimizePageContextValue = {
  charPickerOpen: boolean
  openCharPicker: () => void
  closeCharPicker: () => void
  targetPickerOpen: boolean
  openTargetPicker: () => void
  closeTargetPicker: () => void
  editorKey: CharacterKey | undefined
  openBuildEditor: (key: CharacterKey) => void
  closeBuildEditor: () => void
  optimizeActions: OptimizeActions | null
  setOptimizeActions: (actions: OptimizeActions | null) => void
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
}

const OptimizePageContext = createContext<OptimizePageContextValue | null>(null)

function OptimizePageContextProvider({ children }: { children: ReactNode }) {
  const [charPickerOpen, setCharPickerOpen] = useState(false)
  const [targetPickerOpen, setTargetPickerOpen] = useState(false)
  const [editorKey, setEditorKey] = useState<CharacterKey | undefined>()
  const [optimizeActions, setOptimizeActions] =
    useState<OptimizeActions | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const openCharPicker = useCallback(() => setCharPickerOpen(true), [])
  const closeCharPicker = useCallback(() => setCharPickerOpen(false), [])
  const openTargetPicker = useCallback(() => setTargetPickerOpen(true), [])
  const closeTargetPicker = useCallback(() => setTargetPickerOpen(false), [])
  const openBuildEditor = useCallback((key: CharacterKey) => setEditorKey(key), [])
  const closeBuildEditor = useCallback(() => setEditorKey(undefined), [])

  const value = useMemo(
    () => ({
      charPickerOpen,
      openCharPicker,
      closeCharPicker,
      targetPickerOpen,
      openTargetPicker,
      closeTargetPicker,
      editorKey,
      openBuildEditor,
      closeBuildEditor,
      optimizeActions,
      setOptimizeActions,
      filtersOpen,
      setFiltersOpen,
    }),
    [
      charPickerOpen,
      openCharPicker,
      closeCharPicker,
      targetPickerOpen,
      openTargetPicker,
      closeTargetPicker,
      editorKey,
      openBuildEditor,
      closeBuildEditor,
      optimizeActions,
      filtersOpen,
    ]
  )

  return (
    <OptimizePageContext.Provider value={value}>
      {children}
    </OptimizePageContext.Provider>
  )
}

export function OptimizePageProvider({ children }: { children: ReactNode }) {
  return (
    <SectionNavProvider>
      <OptimizePageContextProvider>{children}</OptimizePageContextProvider>
    </SectionNavProvider>
  )
}

export function useOptimizePage() {
  const ctx = useContext(OptimizePageContext)
  const nav = useContext(SectionNavContext)
  if (!ctx)
    throw new Error('useOptimizePage must be used within OptimizePageProvider')
  return {
    ...ctx,
    scrollToSection: nav.scrollToSection,
    activeSection: nav.activeSection as OptimizeSectionId,
  }
}
