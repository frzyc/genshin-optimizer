import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import {
  CharacterContext,
  useDatabase,
  usePandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import { useResolvedOptTarget } from '@genshin-optimizer/gi/formula-ui'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import {
  Alert,
  AlertTitle,
  Box,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizePage } from './context/OptimizePageContext'
import { OPT_SECTION_IDS } from './nav/optimizeSections'

export function OptimizeReadiness() {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const database = useDatabase()
  const arts = useDataManagerValues(database.arts)
  const { tag } = useResolvedOptTarget()
  const pandoTeam = usePandoTeam(character.key)
  const { openTargetPicker, scrollToSection, setFiltersOpen } = useOptimizePage()

  const items = useMemo(
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
          setFiltersOpen(true)
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
    ]
  )

  const readyCount = items.filter((i) => i.done).length
  if (readyCount === items.length) return null

  return (
    <Alert severity="info" sx={{ py: 0.5 }}>
      <AlertTitle>{t('readinessTitle')}</AlertTitle>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {item.done ? (
                <CheckCircleOutlineIcon color="success" fontSize="small" />
              ) : (
                <RadioButtonUncheckedIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                item.done ? (
                  item.label
                ) : (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={item.action}
                    sx={{ textAlign: 'left' }}
                  >
                    {item.label}
                  </Link>
                )
              }
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'none' }} aria-hidden>
        {readyCount}/{items.length}
      </Box>
    </Alert>
  )
}
