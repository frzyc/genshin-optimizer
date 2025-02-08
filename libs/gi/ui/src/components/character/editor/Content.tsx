import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  allTravelerKeys,
  charKeyToLocCharKey,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BuildEditContext, DataContext, SillyContext } from '../../../context'
import { AddTeamInfo } from '../../AddTeamInfo'
import { LevelSelect } from '../../LevelSelect'
import {
  CharacterCompactConstSelector,
  CharacterCoverArea,
} from '../CharacterProfilePieces'
import { EquippedGrid } from '../EquippedGrid'
import { TalentDropdown } from '../TalentDropdown'
import { CharacterConstellationName, CharacterName } from '../Trans'
import { CharacterCardStats } from '../card/CharacterCardStats'
import { LoadoutCard } from './LoadoutCard'
import { TravelerGenderSelect } from './TravelerGenderSelect'

export function Content({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation([
    'page_character',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const navigate = useNavigate()
  const database = useDatabase()
  const {
    character,
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const { silly } = useContext(SillyContext)
  const deleteCharacter = useCallback(async () => {
    const name = t(
      `${
        silly ? 'sillyWisher_charNames' : 'charNames_gen'
      }:${charKeyToLocGenderedCharKey(characterKey, gender)}`
    )

    if (!window.confirm(t('removeCharacter', { value: name }))) return
    database.chars.remove(characterKey)
    navigate('/characters')
  }, [database, navigate, characterKey, gender, silly, t])

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        <TravelerGenderSelect />
        <Button
          color="error"
          onClick={() => deleteCharacter()}
          startIcon={<DeleteForeverIcon />}
          sx={{ marginLeft: 'auto' }}
        >
          {t('delete')}
        </Button>
        {!!onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Box>
        <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
          <Grid item xs={8} sm={5} md={4} lg={3}>
            <CardThemed
              bgt="light"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CharacterCoverArea />
              <Box sx={{ px: 1 }}>
                <LevelSelect
                  level={character.level}
                  ascension={character.ascension}
                  setBoth={(data) => {
                    allTravelerKeys.includes(characterKey)
                      ? allTravelerKeys.forEach((tkey) => {
                          database.chars.set(tkey, data)
                        })
                      : database.chars.set(characterKey, data)
                  }}
                />
              </Box>
              <CharacterCardStats bgt="light" />
              <Typography sx={{ textAlign: 'center', pb: -1 }} variant="h6">
                <CharacterConstellationName
                  characterKey={characterKey}
                  gender={gender}
                />
              </Typography>
              <Box sx={{ px: 1 }}>
                <CharacterCompactConstSelector
                  setConstellation={(constellation) =>
                    database.chars.set(characterKey, {
                      constellation,
                    })
                  }
                />
              </Box>
            </CardThemed>
          </Grid>
          <Grid
            item
            xs={12}
            sm={7}
            md={8}
            lg={9}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box>
              <Grid container columns={3} spacing={1}>
                {(['auto', 'skill', 'burst'] as const).map((talentKey) => (
                  <Grid item xs={1} key={talentKey}>
                    <TalentDropdown
                      key={talentKey}
                      talentKey={talentKey}
                      dropDownButtonProps={{
                        startIcon: (
                          <ImgIcon
                            src={characterSheet.getTalentOfKey(talentKey)?.img}
                            size={1.75}
                            sideMargin
                          />
                        ),
                      }}
                      setTalent={(talent) =>
                        database.chars.set(characterKey, (char) => {
                          char.talent[talentKey] = talent
                        })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <EquipmentSection />
            <InTeam />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

function EquipmentSection() {
  const {
    character: { key: characterKey, equippedArtifacts },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)

  const database = useDatabase()

  const weaponTypeKey = getCharStat(characterKey).weaponType
  const weaponId = data.get(input.weapon.id).value
  const artifactIds = useMemo(
    () =>
      objKeyMap(
        allArtifactSlotKeys,
        (slotKey) => data.get(input.art[slotKey].id).value
      ),
    [data]
  )

  return (
    <Box>
      <BuildEditContext.Provider value={'equipped'}>
        <EquippedGrid
          weaponTypeKey={weaponTypeKey}
          weaponId={weaponId}
          artifactIds={artifactIds}
          setWeapon={(id) => {
            database.weapons.set(id, {
              location: charKeyToLocCharKey(characterKey),
            })
          }}
          setArtifact={(slotKey, id) => {
            if (!id)
              database.arts.set(equippedArtifacts[slotKey], { location: '' })
            else
              database.arts.set(id, {
                location: charKeyToLocCharKey(characterKey),
              })
          }}
        />
      </BuildEditContext.Provider>
    </Box>
  )
}
function InTeam() {
  const { t } = useTranslation('page_character')
  const navigate = useNavigate()

  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()
  const [dbDirty, setDbDirty] = useForceUpdate()
  const loadoutTeamMap = useMemo(() => {
    const loadoutTeamMap: Record<string, string[]> = {}
    database.teamChars.entries.map(([teamCharId, teamChar]) => {
      if (teamChar.key !== characterKey) return
      if (!loadoutTeamMap[teamCharId]) loadoutTeamMap[teamCharId] = []
    })
    database.teams.entries.forEach(([teamId, team]) => {
      const teamCharIdWithCKey = team.loadoutData.find(
        (loadoutDatum) =>
          loadoutDatum &&
          database.teamChars.get(loadoutDatum?.teamCharId)?.key === characterKey
      )
      if (teamCharIdWithCKey)
        loadoutTeamMap[teamCharIdWithCKey?.teamCharId].push(teamId)
    })
    return dbDirty && loadoutTeamMap
  }, [dbDirty, characterKey, database])
  useEffect(
    () => database.teams.followAny(() => setDbDirty()),
    [database, setDbDirty]
  )
  useEffect(
    () => database.teamChars.followAny(() => setDbDirty()),
    [database, setDbDirty]
  )
  const onAddNewTeam = () => {
    const teamId = database.teams.new()
    const teamCharId = database.teamChars.new(characterKey)
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId } as LoadoutDatum
    })
    navigate(`/teams/${teamId}`)
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant={'h6'}>
        <Trans t={t} i18nKey={'charContentModal.loadoutsWith'}>
          Team Loadouts with{' '}
          <CharacterName characterKey={characterKey} gender={gender} />
        </Trans>
      </Typography>
      {!Object.values(loadoutTeamMap).length && <AddTeamInfo />}

      {Object.entries(loadoutTeamMap).map(([teamCharId, teamIds]) => (
        <LoadoutCard
          key={teamCharId}
          teamCharId={teamCharId}
          teamIds={teamIds}
        />
      ))}
      <Button
        fullWidth
        onClick={() => onAddNewTeam()}
        color="info"
        startIcon={<AddIcon />}
        variant="outlined"
        sx={{ backgroundColor: 'contentLight.main' }}
      >
        {t('charContentModal.addLoAndTeam')}
      </Button>
      <CardThemed bgt="light"></CardThemed>
    </Box>
  )
}
