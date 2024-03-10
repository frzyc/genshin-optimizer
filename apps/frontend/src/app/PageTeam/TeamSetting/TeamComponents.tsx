import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import {
  useBuildTc,
  useCharacter,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import { ArtifactSetName } from '@genshin-optimizer/gi/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CardLight from '../../Components/Card/CardLight'
import { CharacterCardEquipmentRow } from '../../Components/Character/CharacterCard/CharacterCardEquipmentRow'
import {
  CharacterCardHeader,
  CharacterCardHeaderContent,
} from '../../Components/Character/CharacterCard/CharacterCardHeader'
import ColorText from '../../Components/ColoredText'
import DocumentDisplay from '../../Components/DocumentDisplay'
import { NodeFieldDisplay } from '../../Components/FieldDisplay'
import ImgIcon from '../../Components/Image/ImgIcon'
import { InfoTooltipInline } from '../../Components/InfoTooltip'
import { WeaponFullCardObj } from '../../Components/Weapon/WeaponFullCard'
import type { CharacterContextObj } from '../../Context/CharacterContext'
import { CharacterContext } from '../../Context/CharacterContext'
import type { dataContextObj } from '../../Context/DataContext'
import { DataContext } from '../../Context/DataContext'
import type { TeamCharacterContextObj } from '../../Context/TeamCharacterContext'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
import { dataSetEffects, getArtSheet } from '../../Data/Artifacts'
import type CharacterSheet from '../../Data/Characters/CharacterSheet'
import { resonanceSheets } from '../../Data/Resonance'
import { input } from '../../Formula'
import type { NodeDisplay } from '../../Formula/uiData'

export function TeamBuffDisplay() {
  const { data, oldData } = useContext(DataContext)
  const teamBuffs = data.getTeamBuff() as any
  const nodes: Array<[string[], NodeDisplay<number>]> = []
  Object.entries(teamBuffs.total ?? {}).forEach(
    ([key, node]: [key: string, node: any]) =>
      !node.isEmpty && node.value !== 0 && nodes.push([['total', key], node])
  )
  Object.entries(teamBuffs.premod ?? {}).forEach(
    ([key, node]: [key: string, node: any]) =>
      !node.isEmpty && node.value !== 0 && nodes.push([['premod', key], node])
  )
  Object.entries(teamBuffs.enemy ?? {}).forEach(
    ([key, node]: [key: string, node: any]) =>
      !node.isEmpty &&
      typeof node.value === 'number' &&
      node.value !== 0 &&
      nodes.push([['enemy', key], node as NodeDisplay<number>])
  )
  if (!nodes.length) return null
  return (
    <CardLight>
      <CardContent>
        <Typography>Team Buffs</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container>
          {nodes.map(
            ([path, n]) =>
              n && (
                <Grid item xs={12} key={JSON.stringify(n.info)}>
                  <NodeFieldDisplay
                    node={n}
                    oldValue={objPathValue(oldData?.getTeamBuff(), path)?.value}
                  />
                </Grid>
              )
          )}
        </Grid>
      </CardContent>
    </CardLight>
  )
}
export function ResonanceDisplay({ teamId }: { teamId: string }) {
  const { t } = useTranslation('page_character')
  const { data } = useContext(DataContext)

  const { teamCharIds } = useTeam(teamId)!
  const teamCount = teamCharIds.reduce((a, t) => a + (t ? 1 : 0), 0)
  return (
    <>
      <CardLight>
        <CardHeader
          title={
            <span>
              {t('tabTeambuff.team_reso')}{' '}
              <strong>
                <ColorText color={teamCount >= 4 ? 'success' : 'warning'}>
                  ({teamCount}/4)
                </ColorText>
              </strong>{' '}
              <InfoTooltipInline
                title={<Typography>{t`tabTeambuff.resonance_tip`}</Typography>}
              />
            </span>
          }
          titleTypographyProps={{ variant: 'subtitle2' }}
        />
      </CardLight>
      {resonanceSheets.map((res, i) => (
        <CardLight key={i} sx={{ opacity: res.canShow(data) ? 1 : 0.5 }}>
          <CardHeader
            title={
              <span>
                {res.name}{' '}
                <InfoTooltipInline
                  title={<Typography>{res.desc}</Typography>}
                />
              </span>
            }
            action={res.icon}
            titleTypographyProps={{ variant: 'subtitle2' }}
          />
          {res.canShow(data) && <Divider />}
          {res.canShow(data) && (
            <CardContent>
              <DocumentDisplay sections={res.sections} teamBuffOnly hideDesc />
            </CardContent>
          )}
        </CardLight>
      ))}
    </>
  )
}
export function TeammateDisplay({
  teamCharId,
  dataContextValue,
  teamId,
}: {
  teamCharId: string
  teamId: string
  dataContextValue: dataContextObj
}) {
  const { teamData } = dataContextValue
  const team = useTeam(teamId)!
  const teamChar = useTeamChar(teamCharId)!
  const teamMateKey = teamChar?.key
  const character = useCharacter(teamMateKey)!
  const { key: characterKey } = character

  const dataBundle = teamData[teamMateKey]
  const teammateCharacterContext: TeamCharacterContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        teamId,
        team,
        teamCharId,
        teamChar,
        character,
        characterSheet: dataBundle.characterSheet,
      },
    [teamId, team, teamCharId, teamChar, character, dataBundle]
  )
  const characterContext: CharacterContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        character,
        characterSheet: dataBundle.characterSheet,
      },
    [character, dataBundle]
  )
  const teamMateDataContext: dataContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        data: dataBundle.target,
        teamData: teamData,
      },
    [dataBundle, teamData]
  )
  if (
    !teamMateKey ||
    !teammateCharacterContext ||
    !teamMateDataContext ||
    !characterContext
  )
    return null
  return (
    <TeamCharacterContext.Provider value={teammateCharacterContext}>
      <DataContext.Provider value={teamMateDataContext}>
        <CharacterContext.Provider value={characterContext}>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={600} />
            }
          >
            <CardThemed bgt="light">
              <CharacterCardHeader characterKey={characterKey}>
                <CharacterCardHeaderContent characterKey={characterKey} />
              </CharacterCardHeader>
            </CardThemed>

            <EquipmentRow />
            <CharArtifactCondDisplay />
            <CharacterCardWeaponFull teamCharId={teamCharId} />
            <CharWeaponCondDisplay />
            <CharTalentCondDisplay />
          </Suspense>
        </CharacterContext.Provider>
      </DataContext.Provider>
    </TeamCharacterContext.Provider>
  )
}
function EquipmentRow() {
  const {
    teamChar: { buildType },
  } = useContext(TeamCharacterContext)
  if (buildType !== 'tc') return <CharacterCardEquipmentRow hideWeapon />
  else return <TcEquipmentRow />
}
function TcEquipmentRow() {
  const {
    teamChar: { buildTcId },
  } = useContext(TeamCharacterContext)
  const {
    artifact: { sets },
  } = useBuildTc(buildTcId)!
  return (
    <CardThemed bgt="light" sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* TODO: Translation */}
        <SqBadge color="info">TC Build</SqBadge>
        {Object.entries(sets).map(([setKey, number]) => (
          <Box
            key={setKey}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ImgIcon size={2} src={artifactAsset(setKey, 'flower')} />
            <span>
              <ArtifactSetName setKey={setKey} />
            </span>
            <SqBadge>x{number}</SqBadge>
          </Box>
        ))}
      </Box>
    </CardThemed>
  )
}
function CharacterCardWeaponFull({ teamCharId }: { teamCharId: string }) {
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const weapon = useMemo(() => {
    const weaponId = data.get(input.weapon.id).value?.toString() ?? 'invalid'

    if (weaponId && weaponId !== 'invalid')
      return database.weapons.get(weaponId)
    else return database.teamChars.getLoadoutWeapon(teamCharId) // TC build
  }, [database, data, teamCharId])
  console.log({ weapon })
  if (!weapon) return null
  return <WeaponFullCardObj weapon={weapon} bgt="light" />
}
function CharArtifactCondDisplay() {
  const { data } = useContext(DataContext)
  const sections = useMemo(
    () =>
      Object.entries(dataSetEffects(data)).flatMap(([setKey, setNums]) =>
        setNums.flatMap((sn) => getArtSheet(setKey).setEffectDocument(sn) ?? [])
      ),
    [data]
  )
  if (!sections) return null
  return <DocumentDisplay bgt="light" sections={sections} teamBuffOnly={true} />
}
function CharWeaponCondDisplay() {
  const {
    character: { key: charKey },
  } = useContext(CharacterContext)
  const { teamData } = useContext(DataContext)
  const weaponSheet = teamData[charKey]!.weaponSheet
  if (!weaponSheet.document) return null
  return (
    <DocumentDisplay
      bgt="light"
      sections={weaponSheet.document}
      teamBuffOnly={true}
    />
  )
}
function CharTalentCondDisplay() {
  const {
    character: { key: charKey },
  } = useContext(CharacterContext)
  const { teamData } = useContext(DataContext)
  const characterSheet = teamData[charKey]!.characterSheet as CharacterSheet
  const sections = Object.values(characterSheet.talent).flatMap(
    (sts) => sts.sections
  )
  if (!sections) return null
  return <DocumentDisplay bgt="light" sections={sections} teamBuffOnly={true} />
}
