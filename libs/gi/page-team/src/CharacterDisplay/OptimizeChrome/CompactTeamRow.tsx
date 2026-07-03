import { useDataManagerKeys } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import {
  CharacterName,
  DataContext,
  type OptimizeFlowKind,
  SillyContext,
  TeamIcon,
  ensureOptimizeContext,
  getFlowCharTabPath,
  iconAsset,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Button, IconButton, Typography, useTheme } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TeamSettingsModal } from '../../TeamSettingsModal'
import { TeamBuffsPanel } from './TeamBuffsPanel'

const TEAMMATE_SIZE = 76

export function CompactTeamRow({
  teamBuffsOpen,
  onToggleTeamBuffs,
  flow = 'experiment',
}: {
  teamBuffsOpen: boolean
  onToggleTeamBuffs: () => void
  flow?: OptimizeFlowKind
}) {
  const { t } = useTranslation('page_optimize')
  const theme = useTheme()
  const navigate = useNavigate()
  const { teamId, team, teamCharId } = useContext(TeamCharacterContext)
  const dataContextValue = useContext(DataContext)
  const database = useDatabase()
  const { gender } = useDBMeta()
  const { loadoutData, name: teamName } = team
  const characterKey = database.teamChars.get(teamCharId)!.key

  const [charSelectIndex, setCharSelectIndex] = useState<number | undefined>()
  const [showSettings, onShowSettings, onHideSettings] = useBoolState()

  const teamKeys = useDataManagerKeys(database.teams)
  const teamIds = useMemo(
    () =>
      [...teamKeys].sort((a, b) => {
        const editA = database.teams.get(a)?.lastEdit ?? 0
        const editB = database.teams.get(b)?.lastEdit ?? 0
        return editB - editA
      }),
    [teamKeys, database.teams]
  )

  const onTeamSwitch = (newTeamId: string) => {
    if (newTeamId === teamId) return
    ensureOptimizeContext(database, {
      characterKey,
      teamCharId,
      teamId: newTeamId,
    })
    navigate(getFlowCharTabPath(flow, newTeamId, characterKey, 'optimize'))
  }

  const teamBuffHighlight = teamBuffsOpen
    ? colorToRgbaString(hexToColor(theme.palette.primary.main)!, 0.12)
    : undefined

  return (
    <>
      <TeamSettingsModal
        teamId={teamId}
        teamIds={teamIds}
        show={showSettings}
        onClose={onHideSettings}
        onTeamSwitch={onTeamSwitch}
      />
      <Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'stretch',
            minHeight: TEAMMATE_SIZE + 12,
            px: 1,
            py: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              flex: '1 1 200px',
              minWidth: 0,
              alignSelf: 'center',
            }}
          >
            <BootstrapTooltip title={t('contextBar.teamBuffs')}>
              <Button
                variant="outlined"
                color="neutral200"
                onClick={onToggleTeamBuffs}
                startIcon={<TeamIcon />}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: teamBuffsOpen ? 'rotate(180deg)' : undefined,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                }
                sx={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: 0,
                  border: 'none',
                  textTransform: 'none',
                  bgcolor: teamBuffHighlight,
                  '&:hover': {
                    bgcolor: teamBuffHighlight ?? 'rgba(255,255,255,0.08)',
                    border: 'none',
                  },
                }}
              >
                <Typography noWrap component="span" variant="h6">
                  {teamName}
                </Typography>
              </Button>
            </BootstrapTooltip>
            <BootstrapTooltip title={t('teamRow.settings')}>
              <IconButton
                onClick={onShowSettings}
                aria-label={t('teamRow.settings')}
                sx={{
                  borderRadius: 0,
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.25)',
                  px: 1.25,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderLeft: '1px solid rgba(255,255,255,0.25)',
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </BootstrapTooltip>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'stretch',
              flex: '0 0 auto',
              ml: { sm: 'auto' },
            }}
          >
            {loadoutData.map((loadoutDatum, ind) => (
              <TeammateSlot
                key={loadoutDatum?.teamCharId ?? `empty-${ind}`}
                index={ind}
                loadoutDatum={loadoutDatum}
                loadoutData={loadoutData}
                activeCharacterKey={characterKey}
                onAdd={() => setCharSelectIndex(ind)}
                gender={gender}
                isOnField={ind === 0}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ px: 1, pb: teamBuffsOpen ? 1 : 0 }}>
          <TeamBuffsPanel
            teamId={teamId}
            team={team}
            open={teamBuffsOpen}
            dataContextValue={dataContextValue}
            charSelectIndex={charSelectIndex}
            onCharSelectIndex={setCharSelectIndex}
          />
        </Box>
      </Box>
    </>
  )
}

function TeammateSlot({
  index,
  loadoutDatum,
  loadoutData,
  activeCharacterKey,
  onAdd,
  gender,
  isOnField,
}: {
  index: number
  loadoutDatum?: LoadoutDatum
  loadoutData: Array<LoadoutDatum | undefined>
  activeCharacterKey: CharacterKey
  onAdd: () => void
  gender: ReturnType<typeof useDBMeta>['gender']
  isOnField: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const theme = useTheme()
  const { silly } = useContext(SillyContext)
  const database = useDatabase()

  const empty = !loadoutDatum?.teamCharId
  const disabled = !!index && !loadoutData.some((ld) => ld)

  if (empty) {
    return (
      <BootstrapTooltip title={t('teamRow.addTeammate')}>
        <Box component="span" sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <IconButton
            onClick={onAdd}
            disabled={disabled}
            aria-label={t('teamRow.addTeammate')}
            sx={{
              width: TEAMMATE_SIZE,
              height: '100%',
              minHeight: TEAMMATE_SIZE,
              borderRadius: 1.5,
              border: (t) => `2px dashed ${t.palette.divider}`,
              bgcolor: 'rgba(0,0,0,0.2)',
              alignSelf: 'stretch',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </BootstrapTooltip>
    )
  }

  const characterKey = database.teamChars.get(loadoutDatum.teamCharId)!.key
  const element = getCharEle(characterKey)
  const eleColor = theme.palette[element].main as string
  const eleRgb = hexToColor(eleColor)
  const borderColor = (eleRgb && colorToRgbaString(eleRgb, 0.85)) ?? eleColor
  const isActive = characterKey === activeCharacterKey
  const rarity = getCharStat(characterKey).rarity

  const tooltip = (
    <Box>
      <CharacterName characterKey={characterKey} gender={gender} />
      {isOnField && (
        <Typography variant="caption" display="block" color="success.light">
          {t('teamRow.onField')}
        </Typography>
      )}
    </Box>
  )

  return (
    <BootstrapTooltip title={tooltip}>
      <Box component="span" sx={{ display: 'flex', alignSelf: 'stretch' }}>
        <IconButton
          onClick={onAdd}
          aria-label={t('teamRow.addTeammate')}
          sx={{
            width: TEAMMATE_SIZE,
            height: '100%',
            minHeight: TEAMMATE_SIZE,
            p: 0,
            borderRadius: 1.5,
            overflow: 'hidden',
            alignSelf: 'stretch',
            border: `2px solid ${borderColor}`,
            boxShadow: isOnField
              ? `0 0 0 2px ${theme.palette.success.main}, 0 2px 8px rgba(0,0,0,0.35)`
              : isActive
                ? `0 0 0 2px ${theme.palette.info.main}, 0 2px 8px rgba(0,0,0,0.25)`
                : '0 2px 6px rgba(0,0,0,0.2)',
            opacity: disabled ? 0.5 : 1,
            position: 'relative',
            transition: 'filter 0.15s ease, transform 0.15s ease',
            '&:hover': {
              filter: 'brightness(1.1)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box
            className={`grad-${rarity}star`}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={iconAsset(characterKey, gender, silly)}
              alt=""
              draggable={false}
              sx={{
                width: '92%',
                height: '92%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
              }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              lineHeight: 0,
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
            }}
          >
            <ElementIcon ele={element} iconProps={{ fontSize: 'small' }} />
          </Box>
        </IconButton>
      </Box>
    </BootstrapTooltip>
  )
}
