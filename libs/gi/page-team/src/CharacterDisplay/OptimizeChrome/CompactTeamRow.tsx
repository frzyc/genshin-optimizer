import { useDataManagerKeys } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
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
  CharacterSingleSelectionModal,
  DataContext,
  type OptimizeFlowKind,
  SillyContext,
  ensureOptimizeContext,
  getFlowCharTabPath,
  iconAsset,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  CardContent,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material'
import { Suspense, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TeamSettingsModal } from '../../TeamSettingsModal'
import { TeamBuffsPanel } from './TeamBuffsPanel'

const TEAMMATE_SIZE = 52

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
  const onSingleSelect = (cKey: CharacterKey) => {
    if (charSelectIndex === undefined) return
    database.chars.getWithInitWeapon(cKey)
    const existingIndex = loadoutData.findIndex(
      (ld) =>
        ld?.teamCharId && database.teamChars.get(ld.teamCharId)?.key === cKey
    )
    if (existingIndex < 0) {
      let newTeamCharId = database.teamChars.keys.find(
        (k) => database.teamChars.get(k)!.key === cKey
      )
      if (!newTeamCharId) newTeamCharId = database.teamChars.new(cKey)
      database.teams.set(teamId, (team) => {
        team.loadoutData[charSelectIndex] = {
          teamCharId: newTeamCharId,
        } as LoadoutDatum
      })
    } else if (existingIndex !== charSelectIndex) {
      const existingLoadoutDatum = loadoutData[existingIndex]
      const destinationLoadoutDatum = loadoutData[charSelectIndex]
      database.teams.set(teamId, (team) => {
        team.loadoutData[charSelectIndex] = existingLoadoutDatum
        if (
          team.loadoutData[existingIndex]?.teamCharId ===
          existingLoadoutDatum?.teamCharId
        ) {
          team.loadoutData[existingIndex] = destinationLoadoutDatum
        }
      })
    }
    setCharSelectIndex(undefined)
  }

  return (
    <>
      <TeamSettingsModal
        teamId={teamId}
        teamIds={teamIds}
        show={showSettings}
        onClose={onHideSettings}
        onTeamSwitch={onTeamSwitch}
      />
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={charSelectIndex !== undefined}
          onHide={() => setCharSelectIndex(undefined)}
          onSelect={onSingleSelect}
          selectedIndex={charSelectIndex}
          loadoutData={loadoutData}
        />
      </Suspense>
      <CardThemed bgt="light">
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            py: 1.5,
            '&:last-child': { pb: 1.5 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flex: '0 0 auto',
              }}
            >
              <BootstrapTooltip title={t('contextBar.teamBuffs')}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onToggleTeamBuffs}
                  endIcon={
                    <ExpandMoreIcon
                      sx={{
                        transform: teamBuffsOpen ? 'rotate(180deg)' : undefined,
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    maxWidth: '100%',
                    borderColor: teamBuffsOpen ? 'primary.main' : 'divider',
                    bgcolor: teamBuffsOpen
                      ? colorToRgbaString(
                          hexToColor(theme.palette.primary.main)!,
                          0.08
                        )
                      : undefined,
                  }}
                >
                  <Typography noWrap component="span" variant="subtitle1">
                    {teamName}
                  </Typography>
                </Button>
              </BootstrapTooltip>
              <BootstrapTooltip title={t('teamRow.settings')}>
                <IconButton
                  onClick={onShowSettings}
                  aria-label={t('teamRow.settings')}
                  size="small"
                  sx={{
                    border: (t) => `1px solid ${t.palette.divider}`,
                    borderRadius: 1,
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </BootstrapTooltip>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                alignItems: 'center',
                flex: '0 0 auto',
                ml: 'auto',
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
          <TeamBuffsPanel
            teamId={teamId}
            team={team}
            open={teamBuffsOpen}
            dataContextValue={dataContextValue}
          />
        </CardContent>
      </CardThemed>
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
        <span>
          <IconButton
            onClick={onAdd}
            disabled={disabled}
            aria-label={t('teamRow.addTeammate')}
            sx={{
              width: TEAMMATE_SIZE,
              height: TEAMMATE_SIZE,
              borderRadius: 1.5,
              border: (t) => `2px dashed ${t.palette.divider}`,
              bgcolor: 'action.hover',
            }}
          >
            <AddIcon />
          </IconButton>
        </span>
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
      <IconButton
        onClick={onAdd}
        aria-label={t('teamRow.addTeammate')}
        sx={{
          width: TEAMMATE_SIZE,
          height: TEAMMATE_SIZE,
          p: 0,
          borderRadius: 1.5,
          overflow: 'hidden',
          border: `2px solid ${borderColor}`,
          boxShadow: isOnField
            ? `0 0 0 2px ${theme.palette.success.main}`
            : isActive
              ? `0 0 0 2px ${theme.palette.info.main}`
              : undefined,
          opacity: disabled ? 0.5 : 1,
          position: 'relative',
          '&:hover': {
            filter: 'brightness(1.08)',
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
    </BootstrapTooltip>
  )
}
