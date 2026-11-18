import type { ReactNode } from 'react'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { OPT_SECTION_IDS, type OptimizeSectionId } from './optimizeSections'

type SectionNavContextValue = {
  activeSection: OptimizeSectionId
  setActiveSection: (id: OptimizeSectionId) => void
  registerSection: (id: OptimizeSectionId, el: HTMLElement | null) => void
  scrollToSection: (id: OptimizeSectionId) => void
}

export const SectionNavContext = createContext<SectionNavContextValue>({
  activeSection: OPT_SECTION_IDS.character,
  setActiveSection: () => {},
  registerSection: () => {},
  scrollToSection: () => {},
})

export function SectionNavProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<OptimizeSectionId>(
    OPT_SECTION_IDS.character
  )
  const [elements, setElements] = useState<Map<OptimizeSectionId, HTMLElement>>(
    () => new Map()
  )

  const registerSection = useCallback(
    (id: OptimizeSectionId, el: HTMLElement | null) => {
      setElements((prev) => {
        const next = new Map(prev)
        if (el) next.set(id, el)
        else next.delete(id)
        return next
      })
    },
    []
  )

  const scrollToSection = useCallback((id: OptimizeSectionId) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      registerSection,
      scrollToSection,
    }),
    [activeSection, registerSection, scrollToSection]
  )

  return (
    <SectionNavContext.Provider value={value}>
      <SectionNavObserver
        elements={elements}
        setActiveSection={setActiveSection}
      >
        {children}
      </SectionNavObserver>
    </SectionNavContext.Provider>
  )
}

function SectionNavObserver({
  elements,
  setActiveSection,
  children,
}: {
  elements: Map<OptimizeSectionId, HTMLElement>
  setActiveSection: (id: OptimizeSectionId) => void
  children: ReactNode
}) {
  const elementList = useMemo(() => [...elements.entries()], [elements])

  useEffect(() => {
    if (!elementList.length) return

    const visible = new Map<OptimizeSectionId, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as OptimizeSectionId
          if (!id) continue
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio)
          else visible.delete(id)
        }
        if (visible.size === 0) return
        let best: OptimizeSectionId | undefined
        let bestRatio = -1
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        }
        if (best) setActiveSection(best)
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    for (const [, el] of elementList) observer.observe(el)
    return () => observer.disconnect()
  }, [elementList, setActiveSection])

  return children
}
