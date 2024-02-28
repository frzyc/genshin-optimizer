import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CharacterContext } from '../../../Context/CharacterContext'
import { DataContext } from '../../../Context/DataContext'
import { uiInput as input } from '../../../Formula'
import TeamCard from '../../../PageTeams/TeamCard'
import CloseButton from '../../CloseButton'
import ImgIcon from '../../Image/ImgIcon'
import LevelSelect from '../../LevelSelect'
import { CharacterCardStats } from '../CharacterCard/CharacterCardStats'
import {
  CharacterCompactConstSelector,
  CharacterCoverArea,
} from '../CharacterProfilePieces'
import EquippedGrid from '../EquippedGrid'
import TalentDropdown from '../TalentDropdown'
import TravelerGenderSelect from './TravelerGenderSelect'

export default function Content({ onClose }: { onClose?: () => void }) {
  const database = useDatabase()
  const {
    character,
    character: { key: characterKey },
    characterSheet,
  } = useContext(CharacterContext)
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        <TravelerGenderSelect />
        {!!onClose && (
          <CloseButton onClick={onClose} sx={{ marginLeft: 'auto' }} />
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
                  setBoth={(data) => database.chars.set(characterKey, data)}
                />
              </Box>
              <Box sx={{ px: 2 }}>
                <CharacterCardStats />
              </Box>
              <Typography sx={{ textAlign: 'center', pb: -1 }} variant="h6">
                {characterSheet.constellationName}
              </Typography>
              <CharacterCompactConstSelector />
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
                  <Grid item xs={1}>
                    <TalentDropdown
                      key={talentKey}
                      talentKey={talentKey}
                      dropDownButtonProps={{
                        startIcon: (
                          <ImgIcon
                            src={characterSheet.getTalentOfKey(talentKey).img}
                            size={1.75}
                            sideMargin
                          />
                        ),
                      }}
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
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)

  const database = useDatabase()

  const weaponTypeKey = getCharData(characterKey).weaponType
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
      <EquippedGrid
        weaponTypeKey={weaponTypeKey}
        weaponId={weaponId}
        artifactIds={artifactIds}
        setWeapon={(id) => {
          database.weapons.set(id, {
            location: charKeyToLocCharKey(characterKey),
          })
        }}
        setArtifact={(_, id) => {
          database.arts.set(id, {
            location: charKeyToLocCharKey(characterKey),
          })
        }}
      />
    </Box>
  )
}
const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const
function InTeam() {
  const navigate = useNavigate()

  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()
  const teamIds = useMemo(
    () =>
      database.teams.keys.filter((teamId) =>
        database.teams
          .get(teamId)
          .teamCharIds.some(
            (teamCharId) =>
              database.teamChars.get(teamCharId).key === characterKey
          )
      ),
    [characterKey, database]
  )
  if (!teamIds.length) return null

  const onAddTeam = () => {
    const teamId = database.teams.new()
    const teamCharId = database.teamChars.new(characterKey)
    database.teams.set(teamId, (team) => {
      team.teamCharIds[0] = teamCharId
    })
    navigate(`/teams/${teamId}`)
  }

  // TODO: Translation
  return (
    <Box>
      <Typography variant={'h6'}>
        Teams with <CharacterName characterKey={characterKey} gender={gender} />
      </Typography>
      <Grid container columns={columns} spacing={1}>
        {teamIds.map((teamId) => (
          <Grid item key={teamId} xs={1}>
            <TeamCard
              bgt="light"
              teamId={teamId}
              onClick={() => navigate(`/teams/${teamId}`)}
              disableButtons
            />
          </Grid>
        ))}
        <Grid item xs={1}>
          <Button
            fullWidth
            sx={{ height: '100%' }}
            onClick={() => onAddTeam()}
            color="info"
            startIcon={<AddIcon />}
          >
            Add Team
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
