import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useBuildTc,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import {
  ArtifactSetName,
  BuildCard,
  StatWithUnit,
  WeaponCardNanoObj,
} from '@genshin-optimizer/gi/ui'
import { artDisplayValue, getLevelString } from '@genshin-optimizer/gi/util'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

export default function BuildTc({
  buildTcId,
  active = false,
  onChangeBuild,
}: {
  buildTcId: string
  active?: boolean
  onChangeBuild?: () => void
}) {
  const { t } = useTranslation('build')
  const [open, onOpen, onClose] = useBoolState()
  const { teamId, teamCharId } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const buildTc = useBuildTc(buildTcId)!
  const { name, description } = buildTc
  const onActive = useMemo(() => {
    if (active) return undefined
    return () => {
      database.teams.setLoadoutDatum(teamId, teamCharId, {
        buildType: 'tc',
        buildTcId,
      })
      onChangeBuild?.()
    }
  }, [active, database, teamId, teamCharId, buildTcId, onChangeBuild])
  const onRemove = () => {
    //TODO: prompt user for removal
    database.buildTcs.remove(buildTcId)
  }
  const onDupe = () =>
    database.teamChars.newBuildTc(teamCharId, {
      ...structuredClone(buildTc),
      name: t('buildTcCard.copy.nameTc', { name }),
    })
  return (
    <>
      <ModalWrapper open={open} onClose={onClose}>
        <BuildTcEditor buildTcId={buildTcId} onClose={onClose} />
      </ModalWrapper>
      <BuildCard
        name={name}
        description={description}
        active={active}
        onActive={onActive}
        onEdit={onOpen}
        onDupe={onDupe}
        onRemove={onRemove}
      >
        <TcEquip buildTcId={buildTcId} />
      </BuildCard>
    </>
  )
}
function TcEquip({ buildTcId }: { buildTcId: string }) {
  const {
    weapon,
    artifact: {
      slots,
      substats: { stats: substats },
      sets,
    },
    character,
  } = useBuildTc(buildTcId)!
  const weaponSheet = getWeaponSheet(weapon.key)
  const substatsArr = Object.entries(substats)
  const substatsArr1 = substatsArr.slice(0, 5)
  const substatsArr2 = substatsArr.slice(5)
  return (
    <Box>
      {!!character && (
        <CardThemed sx={{ mb: 1 }}>
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            <Chip
              size="small"
              label={`Lv. ${getLevelString(
                character.level,
                character.ascension
              )}`}
              sx={{ color: 'yellow' }}
            />

            <Chip
              size="small"
              label={`C${character.constellation}`}
              sx={{ color: 'yellow' }}
            />
            {/* Can't display talents because that would require a calculation for talent boost due to constellations */}
            <Typography color="yellow">Character Overriden</Typography>
          </CardContent>
        </CardThemed>
      )}
      <Grid
        container
        spacing={1}
        columns={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}
      >
        <Grid
          item
          xs={1}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
            <WeaponCardNanoObj
              weapon={weapon as ICachedWeapon}
              weaponSheet={weaponSheet}
            />
          </CardThemed>

          {!!Object.keys(sets).length && (
            <CardThemed sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
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
          )}
        </Grid>

        <Grid item xs={1}>
          <CardThemed
            sx={{
              flexGrow: 1,
              height: '100%',
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              justifyContent: 'space-between',
            }}
          >
            {Object.entries(slots).map(([sk, { level, statKey }]) => (
              <Box
                key={sk}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <SlotIcon slotKey={sk} />
                <SqBadge>+{level}</SqBadge>
                <StatWithUnit statKey={statKey} />
              </Box>
            ))}
          </CardThemed>
        </Grid>
        {[substatsArr1, substatsArr2].map((arr, i) => (
          <Grid item xs={1} key={i}>
            <CardThemed sx={{ flexGrow: 1, height: '100%' }}>
              <Box
                sx={{
                  p: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                {arr.map(([sk, number]) => (
                  <Box
                    key={sk}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'space-between',
                    }}
                  >
                    <StatWithUnit statKey={sk} />
                    <span>
                      {artDisplayValue(number, getUnitStr(sk))}
                      {getUnitStr(sk)}
                    </span>
                  </Box>
                ))}
              </Box>
            </CardThemed>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function BuildTcEditor({
  buildTcId,
  onClose,
}: {
  buildTcId: string
  onClose: () => void
}) {
  const { t } = useTranslation('build')
  const database = useDatabase()
  const build = useBuildTc(buildTcId)!

  const [name, setName] = useState(build.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(build.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on buildId change, to use the new team's name/desc
  useEffect(() => {
    const newBuild = database.buildTcs.get(buildTcId)
    if (!newBuild) return
    const { name, description } = newBuild
    setName(name)
    setDesc(description)
  }, [database, buildTcId])

  useEffect(() => {
    database.buildTcs.set(buildTcId, (build) => {
      build.name = nameDeferred
    })
    // Don't need to trigger when buildId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, nameDeferred])

  useEffect(() => {
    database.buildTcs.set(buildTcId, (build) => {
      build.description = descDeferred
    })
    // Don't need to trigger when buildId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, descDeferred])
  return (
    <CardThemed>
      <CardHeader
        title={t('buildTcCard.edit.title')}
        action={
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label={t('buildTcCard.edit.label')}
          placeholder={t('buildTcCard.edit.placeholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label={t('buildTcCard.edit.desc')}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          multiline
          minRows={2}
        />
      </CardContent>
    </CardThemed>
  )
}
