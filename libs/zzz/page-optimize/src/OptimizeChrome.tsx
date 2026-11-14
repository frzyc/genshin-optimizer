import { ImgIcon } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import {
  OptTargetSelectedLabel,
  useResolvedOptTarget,
} from '@genshin-optimizer/zzz/formula-ui'
import { CharacterName } from '@genshin-optimizer/zzz/ui'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Box,
  Button,
  Collapse,
  Drawer,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompactBuildEquipGrid } from './CompactBuildEquipGrid'
import { useOptimizePage } from './context/OptimizePageContext'
import {
  MOBILE_APP_BAR_OFFSET_PX,
  MOBILE_STICKY_CHROME_TABS_ONLY_PX,
  TEAM_HEADER_HEIGHT_PX,
  useReportTeamHeaderHeight,
} from './context/TeamHeaderHeightContext'
import { DesktopDashboardHeader } from './DesktopDashboardHeader'
import { useRevealOnScrollUp } from './hooks/useRevealOnScrollUp'
import { OPT_SECTION_IDS, optimizeSectionOrder } from './nav/optimizeSections'
import { MobileSectionTabs } from './nav/SectionRail'
import { TeamAvatarRow } from './TeamAvatarRow'

export function OptimizeChrome({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false)
  const contextBarVisible = useRevealOnScrollUp({
    enabled: isMobile && !contextDrawerOpen,
  })

  useReportTeamHeaderHeight(
    isMobile
      ? contextBarVisible
        ? TEAM_HEADER_HEIGHT_PX
        : MOBILE_STICKY_CHROME_TABS_ONLY_PX
      : TEAM_HEADER_HEIGHT_PX
  )

  const sections = optimizeSectionOrder(characterKey)

  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: MOBILE_APP_BAR_OFFSET_PX, md: 0 },
        zIndex: 110,
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.shadows[1],
        py: { xs: 0.75, md: 1 },
        px: { xs: 0.5, sm: 1 },
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {isMobile ? (
        <>
          <Collapse in={contextBarVisible} unmountOnExit>
            <MobileContextTrigger
              characterKey={characterKey}
              onOpen={() => setContextDrawerOpen(true)}
            />
          </Collapse>
          <MobileSectionTabs sections={sections} />
          <Drawer
            anchor="bottom"
            open={contextDrawerOpen}
            onClose={() => setContextDrawerOpen(false)}
            slotProps={{
              paper: { sx: { maxHeight: '85vh' } },
            }}
          >
            <OptimizeContextControls
              characterKey={characterKey}
              onNavigate={() => setContextDrawerOpen(false)}
            />
          </Drawer>
        </>
      ) : (
        <DesktopDashboardHeader characterKey={characterKey} />
      )}
    </Box>
  )
}

function MobileContextTrigger({
  characterKey,
  onOpen,
}: {
  characterKey: CharacterKey
  onOpen: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const { tag } = useResolvedOptTarget()
  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth
      onClick={onOpen}
      startIcon={
        <ImgIcon size={1.5} src={characterAsset(characterKey, 'circle')} />
      }
      endIcon={<TuneIcon fontSize="small" />}
      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
    >
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <Typography variant="body2" noWrap>
          <CharacterName characterKey={characterKey} />
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: 'block' }}
        >
          {tag ? t('mobileContextHasTarget') : t('mobileContextNoTarget')}
        </Typography>
      </Box>
    </Button>
  )
}

function OptimizeContextControls({
  characterKey,
  onNavigate,
}: {
  characterKey: CharacterKey
  onNavigate?: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const { openCharPicker, openBuildEditor, openTargetPicker, scrollToSection } =
    useOptimizePage()
  const character = useCharacterContext()
  const team = useTeam(characterKey)
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const hitModeLabel = team ? t(`critMode_${getTeamFrame0(team).critMode}`) : ''
  const wrap = () => onNavigate?.()
  const run = (fn: () => void) => () => {
    fn()
    wrap()
  }

  return (
    <Stack
      direction="column"
      spacing={0.5}
      useFlexGap
      sx={{ alignItems: 'stretch', p: 2, width: '100%' }}
    >
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
        {t('mobileContextTitle')}
      </Typography>
      <ContextChip
        label={t('contextCharacter')}
        onClick={run(openCharPicker)}
        startIcon={
          <ImgIcon size={1.5} src={characterAsset(characterKey, 'circle')} />
        }
      >
        <CharacterName characterKey={characterKey} />
      </ContextChip>
      <ContextChip
        label={t('contextBuild')}
        onClick={run(() => character && openBuildEditor(character.key))}
      >
        {character ? (
          <CompactBuildEquipGrid
            wengineId={character.equippedWengine}
            discIds={character.equippedDiscs}
          />
        ) : null}
      </ContextChip>
      <Tooltip title={t('commandShortcutTarget')}>
        <Box sx={{ width: '100%' }}>
          <ContextChip
            label={t('optimizeTarget')}
            onClick={run(openTargetPicker)}
            color={tag ? 'success' : 'warning'}
          >
            <Stack spacing={0} sx={{ minWidth: 0, width: '100%' }}>
              {currentRef && tag ? (
                <Typography variant="body2" noWrap>
                  <OptTargetSelectedLabel formulaRef={currentRef} inline />
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {t('selectOptTarget')}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                {t('hitModeLine', { mode: hitModeLabel })}
              </Typography>
            </Stack>
          </ContextChip>
        </Box>
      </Tooltip>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          width: '100%',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          component="button"
          type="button"
          onClick={run(() => scrollToSection(OPT_SECTION_IDS.teammates))}
          sx={{
            border: 'none',
            background: 'none',
            p: 0,
            cursor: 'pointer',
            display: 'block',
            textAlign: 'left',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {t('teamRowLabel')}
        </Typography>
        <Box sx={{ mt: 0.25 }}>
          <TeamAvatarRow
            characterKey={characterKey}
            onOpenTeamSection={run(() =>
              scrollToSection(OPT_SECTION_IDS.teammates)
            )}
          />
        </Box>
      </Box>
    </Stack>
  )
}

function ContextChip({
  label,
  onClick,
  startIcon,
  children,
  color,
}: {
  label: string
  onClick: () => void
  startIcon?: ReactNode
  children: ReactNode
  color?: 'success' | 'warning'
}) {
  return (
    <Button
      variant="outlined"
      size="small"
      color={color}
      onClick={onClick}
      fullWidth
      sx={{
        justifyContent: 'flex-start',
        textAlign: 'left',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <Stack spacing={0} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
          }}
        >
          {startIcon}
          {children}
        </Box>
      </Stack>
    </Button>
  )
}
