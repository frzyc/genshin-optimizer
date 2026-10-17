import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import {
  CharacterContext,
  useDatabase,
  usePandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import { useResolvedOptTarget } from '@genshin-optimizer/gi/formula-ui'
import { useMediaQuery, useTheme } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizePage } from '../context/OptimizePageContext'
import { OPT_SECTION_IDS } from '../nav/optimizeSections'

export type ReadinessItem = {
  id: string
  done: boolean
  label: string
  action: () => void
}

export function useOptimizeReadiness() {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const database = useDatabase()
  const arts = useDataManagerValues(database.arts)
  const { tag } = useResolvedOptTarget()
  const pandoTeam = usePandoTeam(character.key)
  const { openTargetPicker, scrollToSection, setFiltersOpen } =
    useOptimizePage()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const items = useMemo<ReadinessItem[]>(
    () => [
      {
        id: 'target',
        done: Boolean(tag),
        label: t('readinessTarget'),
        action: openTargetPicker,
      },
      {
        id: 'artifacts',
        done: arts.length > 0,
        label: t('readinessArtifacts'),
        action: () => {
          scrollToSection(OPT_SECTION_IDS.opt)
          if (isMobile) setFiltersOpen(true)
        },
      },
      {
        id: 'team',
        done: Boolean(pandoTeam?.optConfigId),
        label: t('readinessTeam'),
        action: () => scrollToSection(OPT_SECTION_IDS.teammates),
      },
    ],
    [
      tag,
      arts.length,
      pandoTeam?.optConfigId,
      t,
      openTargetPicker,
      scrollToSection,
      setFiltersOpen,
      isMobile,
    ]
  )

  const readyCount = items.filter((i) => i.done).length
  return {
    items,
    readyCount,
    total: items.length,
    isReady: readyCount === items.length,
  }
}
