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
import { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompactBuildEquipGrid } from './CompactBuildEquipGrid'
import { useOptimizePage } from './context/OptimizePageContext'
import { OPT_SECTION_IDS } from './nav/optimizeSections'
import { OptimizeReadinessBadge } from './readiness/OptimizeReadinessBadge'

const PORTRAIT_PX = 52
const TEAM_AVATAR_PX = 28

export function DesktopDashboardHeader({
  characterKey,
  onCharacterKeyChange,
}: {
  characterKey: CharacterKey
  onCharacterKeyChange: (key: CharacterKey) => void
}) {
  const { t } = useTranslation('page_optimize')
  const { gender } = useDBMeta()
  const { openCharPicker, openBuildEditor, openTargetPicker, scrollToSection } =
    useOptimizePage()
  const { character } = useContext(CharacterContext)
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const pandoTeam = useRequiredPandoTeam()
  const hitModeLabel = t(`critMode_${pandoTeam.critMode}`)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ width: '100%', minWidth: 0 }}
    >
      <OptimizeReadinessBadge />
      <Paper
        elevation={0}
        sx={{
          flex: 1,
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
              src={characterAsset(characterKey, 'icon', gender ?? 'F')}
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
                <CharacterName
                  characterKey={characterKey}
                  gender={gender ?? 'F'}
                />
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
              weaponId={character.equippedWeapon}
              artIds={character.equippedArtifacts}
            />
          ) : null}
        </DashboardRegion>

        <Divider orientation="vertical" flexItem />

        <DashboardRegion
          onClick={() => scrollToSection(OPT_SECTION_IDS.teammates)}
          ariaLabel={t('teamRowLabel')}
          sx={{ flex: '0 1 auto', minWidth: 120 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 0.5, textAlign: 'left' }}
          >
            {t('teamRowLabel')}
          </Typography>
          <TeamAvatarRow
            characterKey={characterKey}
            onCharacterKeyChange={onCharacterKeyChange}
            onOpenTeamSection={() => scrollToSection(OPT_SECTION_IDS.teammates)}
          />
        </DashboardRegion>

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
    </Stack>
  )
}

function DashboardRegion({
  children,
  onClick,
  ariaLabel,
  sx,
}: {
  children: React.ReactNode
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

function TeamAvatarRow({
  characterKey,
  onCharacterKeyChange,
  onOpenTeamSection,
}: {
  characterKey: CharacterKey
  onCharacterKeyChange: (key: CharacterKey) => void
  onOpenTeamSection: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { gender } = useDBMeta()
  const pandoTeam = useRequiredPandoTeam()
  const [pickingSlot, setPickingSlot] = useState<0 | 1 | 2>()

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Stack direction="row" spacing={0.25} alignItems="center">
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
