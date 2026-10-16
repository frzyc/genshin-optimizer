import { ImgIcon } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { pandoTeammateMembers } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  useDatabase,
  useDBMeta,
  useRequiredPandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import {
  OptTargetSelectedLabel,
  useResolvedOptTarget,
} from '@genshin-optimizer/gi/formula-ui'
import {
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Box,
  Button,
  Collapse,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompactBuildEquipGrid } from './CompactBuildEquipGrid'
import { useOptimizePage } from './context/OptimizePageContext'
import {
  MOBILE_APP_BAR_OFFSET_PX,
  MOBILE_STICKY_CHROME_TABS_ONLY_PX,
  TEAM_HEADER_HEIGHT_PX,
  useReportTeamHeaderHeight,
} from './context/TeamHeaderHeightContext'
import { useRevealOnScrollUp } from './hooks/useRevealOnScrollUp'
import { OPT_SECTION_IDS } from './nav/optimizeSections'
import { MobileSectionTabs } from './nav/SectionRail'

export function OptimizeChrome({
  characterKey,
  onCharacterKeyChange,
}: {
  characterKey: CharacterKey
  onCharacterKeyChange: (key: CharacterKey) => void
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

  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: MOBILE_APP_BAR_OFFSET_PX, md: 0 },
        zIndex: 110,
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
        py: 0.75,
        px: { xs: 0.5, sm: 0 },
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
          <MobileSectionTabs />
          <Drawer
            anchor="bottom"
            open={contextDrawerOpen}
            onClose={() => setContextDrawerOpen(false)}
            PaperProps={{ sx: { maxHeight: '85vh' } }}
          >
            <OptimizeContextControls
              characterKey={characterKey}
              onCharacterKeyChange={onCharacterKeyChange}
              layout="column"
              onNavigate={() => setContextDrawerOpen(false)}
            />
          </Drawer>
        </>
      ) : (
        <OptimizeContextControls
          characterKey={characterKey}
          onCharacterKeyChange={onCharacterKeyChange}
          layout="row"
        />
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
  const { gender } = useDBMeta()
  const { tag } = useResolvedOptTarget()
  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth
      onClick={onOpen}
      startIcon={
        <ImgIcon
          size={1.5}
          src={characterAsset(characterKey, 'icon', gender ?? 'F')}
        />
      }
      endIcon={<TuneIcon fontSize="small" />}
      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
    >
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <Typography variant="body2" noWrap>
          <CharacterName characterKey={characterKey} gender={gender ?? 'F'} />
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {tag ? t('mobileContextHasTarget') : t('mobileContextNoTarget')}
        </Typography>
      </Box>
    </Button>
  )
}

function OptimizeContextControls({
  characterKey,
  onCharacterKeyChange,
  layout,
  onNavigate,
}: {
  characterKey: CharacterKey
  onCharacterKeyChange: (key: CharacterKey) => void
  layout: 'row' | 'column'
  onNavigate?: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const { gender } = useDBMeta()
  const {
    openCharPicker,
    openBuildEditor,
    openTargetPicker,
    scrollToSection,
  } = useOptimizePage()
  const { character } = useContext(CharacterContext)
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const pandoTeam = useRequiredPandoTeam()
  const hitModeLabel = t(`critMode_${pandoTeam.critMode}`)
  const isColumn = layout === 'column'
  const wrap = () => onNavigate?.()

  const run =
    (fn: () => void) =>
    () => {
      fn()
      wrap()
    }

  return (
    <Stack
      direction={isColumn ? 'column' : 'row'}
      spacing={0.5}
      useFlexGap
      flexWrap={isColumn ? 'nowrap' : 'wrap'}
      alignItems="stretch"
      sx={{ p: isColumn ? 2 : 0, width: '100%' }}
    >
      {isColumn && (
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          {t('mobileContextTitle')}
        </Typography>
      )}
      <ContextChip
        label={t('contextCharacter')}
        onClick={run(openCharPicker)}
        startIcon={
          <ImgIcon
            size={1.5}
            src={characterAsset(characterKey, 'icon', gender ?? 'F')}
          />
        }
        fullWidth={isColumn}
      >
        <CharacterName characterKey={characterKey} gender={gender ?? 'F'} />
      </ContextChip>
      <ContextChip
        label={t('contextBuild')}
        onClick={run(() => character && openBuildEditor(character.key))}
        fullWidth={isColumn}
        sx={
          isColumn
            ? { maxWidth: '100%' }
            : {
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
                maxWidth: { xs: '100%', sm: 300 },
              }
        }
      >
        {character ? (
          <CompactBuildEquipGrid
            weaponId={character.equippedWeapon}
            artIds={character.equippedArtifacts}
          />
        ) : null}
      </ContextChip>
      <Tooltip title={t('commandShortcutTarget')}>
        <Box sx={{ width: isColumn ? '100%' : undefined }}>
          <ContextChip
            label={t('optimizeTarget')}
            onClick={run(openTargetPicker)}
            color={tag ? 'success' : 'warning'}
            fullWidth={isColumn}
            sx={
              isColumn
                ? { maxWidth: '100%' }
                : {
                    flex: { xs: '1 1 45%', sm: '0 1 auto' },
                    maxWidth: { xs: '100%', sm: 320 },
                  }
            }
          >
            <Stack spacing={0} sx={{ minWidth: 0, width: '100%' }}>
              {currentRef && tag ? (
                <Typography variant="body2" noWrap>
                  <OptTargetSelectedLabel formulaRef={currentRef} />
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
      <TeamContextChip
        characterKey={characterKey}
        onCharacterKeyChange={onCharacterKeyChange}
        onOpenTeamSection={run(() =>
          scrollToSection(OPT_SECTION_IDS.teammates)
        )}
        fullWidth={isColumn}
      />
    </Stack>
  )
}

function ContextChip({
  label,
  onClick,
  startIcon,
  children,
  color,
  sx,
  fullWidth,
}: {
  label: string
  onClick: () => void
  startIcon?: React.ReactNode
  children: React.ReactNode
  color?: 'success' | 'warning'
  sx?: object
  fullWidth?: boolean
}) {
  return (
    <Button
      variant="outlined"
      size="small"
      color={color}
      onClick={onClick}
      fullWidth={fullWidth}
      sx={{
        justifyContent: 'flex-start',
        textAlign: 'left',
        minWidth: 0,
        maxWidth: fullWidth ? '100%' : { xs: '100%', sm: 220 },
        flex: fullWidth
          ? undefined
          : { xs: '1 1 45%', sm: '0 1 auto' },
        ...sx,
      }}
    >
      <Stack spacing={0} alignItems="flex-start" sx={{ minWidth: 0 }}>
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

const TEAM_AVATAR_PX = 28

function TeamContextChip({
  characterKey,
  onCharacterKeyChange,
  onOpenTeamSection,
  fullWidth,
}: {
  characterKey: CharacterKey
  onCharacterKeyChange: (key: CharacterKey) => void
  onOpenTeamSection: () => void
  fullWidth?: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { gender } = useDBMeta()
  const pandoTeam = useRequiredPandoTeam()
  const [pickingSlot, setPickingSlot] = useState<0 | 1 | 2>()

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 1,
        py: 0.5,
        minWidth: 0,
        width: fullWidth ? '100%' : undefined,
        flex: fullWidth ? undefined : { xs: '1 1 100%', sm: '0 1 auto' },
        maxWidth: fullWidth ? '100%' : { xs: '100%', sm: 220 },
        cursor: 'default',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        component="button"
        type="button"
        onClick={onOpenTeamSection}
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
      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ mt: 0.25 }}>
        <Tooltip title={t('onField')}>
          <IconButton
            size="small"
            onClick={() => onCharacterKeyChange(characterKey)}
            sx={{ p: 0.25 }}
          >
            <Box
              component="img"
              src={characterAsset(characterKey, 'icon', gender ?? 'F')}
              alt=""
              sx={{
                width: TEAM_AVATAR_PX,
                height: TEAM_AVATAR_PX,
                borderRadius: '50%',
                outline: '2px solid',
                outlineColor: 'success.main',
              }}
            />
          </IconButton>
        </Tooltip>
        {pandoTeammateMembers.map((member, slot) => {
          const teammateKey = pandoTeam.teammates[slot] ?? ''
          return teammateKey ? (
            <Box key={member} sx={{ position: 'relative' }}>
              <Tooltip
                title={
                  <CharacterName
                    characterKey={teammateKey}
                    gender={gender ?? 'F'}
                  />
                }
              >
                <IconButton
                  size="small"
                  sx={{ p: 0.25 }}
                  onClick={onOpenTeamSection}
                >
                  <Box
                    component="img"
                    src={characterAsset(teammateKey, 'icon', gender ?? 'F')}
                    alt=""
                    sx={{
                      width: TEAM_AVATAR_PX,
                      height: TEAM_AVATAR_PX,
                      borderRadius: '50%',
                    }}
                  />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                aria-label={t('removeTeammate')}
                onClick={() =>
                  database.pandoTeams.setTeammate(
                    characterKey,
                    slot as 0 | 1 | 2,
                    ''
                  )
                }
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  '& .MuiSvgIcon-root': { fontSize: 12 },
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              key={member}
              size="small"
              aria-label={t('addTeammate', { n: slot + 1 })}
              onClick={() => setPickingSlot(slot as 0 | 1 | 2)}
              sx={{ p: 0.25 }}
            >
              <AddIcon sx={{ fontSize: TEAM_AVATAR_PX * 0.65 }} />
            </IconButton>
          )
        })}
      </Stack>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={pickingSlot !== undefined}
          onHide={() => setPickingSlot(undefined)}
          onSelect={(ck) => {
            if (pickingSlot === undefined) return
            database.chars.getWithInitWeapon(ck)
            database.pandoTeams.setTeammate(characterKey, pickingSlot, ck)
            setPickingSlot(undefined)
          }}
        />
      </Suspense>
    </Box>
  )
}
