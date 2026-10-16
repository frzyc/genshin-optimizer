import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TeamHeaderHeightContext } from '../context/TeamHeaderHeightContext'
import {
  OPT_SECTION_I18N,
  type OptimizeSectionId,
} from './optimizeSections'
import { SectionNavContext } from './SectionNavContext'

export function SectionAnchor({
  sectionId,
  children,
  showTitle = true,
}: {
  sectionId: OptimizeSectionId
  children: ReactNode
  showTitle?: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const headerHeight = useContext(TeamHeaderHeightContext)
  const ref = useRef<HTMLDivElement>(null)
  const { registerSection } = useContext(SectionNavContext)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    registerSection(sectionId, el)
    return () => registerSection(sectionId, null)
  }, [sectionId, registerSection])

  const titleKey = OPT_SECTION_I18N[sectionId]

  return (
    <Box
      ref={ref}
      id={sectionId}
      sx={{
        scrollMarginTop: headerHeight + 8,
      }}
    >
      {showTitle && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t(titleKey)}
        </Typography>
      )}
      {children}
    </Box>
  )
}
