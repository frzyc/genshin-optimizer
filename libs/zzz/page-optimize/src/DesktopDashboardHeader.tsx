import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import {
  OptTargetSelectedLabel,
  useResolvedOptTarget,
} from '@genshin-optimizer/zzz/formula-ui'
import { CharacterName } from '@genshin-optimizer/zzz/ui'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import {
  Box,
  ButtonBase,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompactBuildEquipGrid } from './CompactBuildEquipGrid'
import { useOptimizePage } from './context/OptimizePageContext'
import { OPT_SECTION_IDS } from './nav/optimizeSections'
import { TeamAvatarRow } from './TeamAvatarRow'

const PORTRAIT_PX = 52

export function DesktopDashboardHeader({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { t } = useTranslation('page_optimize')
  const { openCharPicker, openBuildEditor, openTargetPicker, scrollToSection } =
    useOptimizePage()
  const character = useCharacterContext()
  const team = useTeam(characterKey)
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const hitModeLabel = team ? t(`critMode_${getTeamFrame0(team).critMode}`) : ''
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 2,
        bgcolor: 'action.hover',
        overflow: 'hidden',
      }}
    >
      <DashboardRegion
        onClick={openCharPicker}
        ariaLabel={t('contextCharacter')}
        sx={{ flex: '0 1 auto', maxWidth: { md: 220, lg: 280 } }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Box
            component="img"
            src={characterAsset(characterKey, 'circle')}
            alt=""
            sx={{
              width: PORTRAIT_PX,
              height: PORTRAIT_PX,
              borderRadius: 1.5,
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0, textAlign: 'left' }}>
            <Typography variant="subtitle1" noWrap fontWeight={600}>
              <CharacterName characterKey={characterKey} />
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              {t('commandShortcutCharacter')}
            </Typography>
          </Box>
        </Stack>
      </DashboardRegion>

      <Divider orientation="vertical" flexItem />

      <DashboardRegion
        onClick={openTargetPicker}
        ariaLabel={t('optimizeTarget')}
        sx={{ flex: '1 1 200px', minWidth: 0 }}
      >
        <Stack
          spacing={0.25}
          sx={{ minWidth: 0, width: '100%', textAlign: 'left' }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('optimizeTarget')}
          </Typography>
          {currentRef && tag ? (
            <Typography variant="body2" noWrap fontWeight={500}>
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
      </DashboardRegion>

      <Divider orientation="vertical" flexItem />

      <DashboardRegion
        onClick={() => character && openBuildEditor(character.key)}
        ariaLabel={t('contextBuild')}
        sx={{ flex: '0 1 auto', px: 1.5 }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 0.5, textAlign: 'left' }}
        >
          {t('contextBuild')}
        </Typography>
        {character ? (
          <CompactBuildEquipGrid
            wengineId={character.equippedWengine}
            discIds={character.equippedDiscs}
          />
        ) : null}
      </DashboardRegion>

      <Divider orientation="vertical" flexItem />

      <Box
        sx={{
          flex: '0 1 auto',
          minWidth: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 2,
          py: 1.25,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          component="button"
          type="button"
          onClick={() => scrollToSection(OPT_SECTION_IDS.teammates)}
          sx={{
            mb: 0.5,
            textAlign: 'left',
            border: 'none',
            background: 'none',
            p: 0,
            cursor: 'pointer',
            display: 'block',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {t('teamRowLabel')}
        </Typography>
        <TeamAvatarRow
          characterKey={characterKey}
          onOpenTeamSection={() => scrollToSection(OPT_SECTION_IDS.teammates)}
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 0.5,
          flexShrink: 0,
        }}
      >
        <Tooltip title={t('chromeMoreActions')}>
          <IconButton
            aria-label={t('chromeMoreActions')}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              openCharPicker()
            }}
          >
            <ListItemIcon>
              <PersonSearchIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('commandPickCharacter')}
              secondary={t('commandShortcutCharacter')}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              openTargetPicker()
            }}
          >
            <ListItemIcon>
              <TrackChangesIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('commandPickTarget')}
              secondary={t('commandShortcutTarget')}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              character && openBuildEditor(character.key)
            }}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('contextBuildHint')} />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              scrollToSection(OPT_SECTION_IDS.teammates)
            }}
          >
            <ListItemIcon>
              <GroupsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('teammates')} />
          </MenuItem>
        </Menu>
      </Box>
    </Paper>
  )
}

function DashboardRegion({
  children,
  onClick,
  ariaLabel,
  sx,
}: {
  children: ReactNode
  onClick: () => void
  ariaLabel: string
  sx?: object
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        px: 2,
        py: 1.25,
        minWidth: 0,
        textAlign: 'left',
        '&:hover': { bgcolor: 'action.selected' },
        ...sx,
      }}
    >
      {children}
    </ButtonBase>
  )
}
