import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { unit } from '@genshin-optimizer/common/util'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useBuildTc, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import { ArtifactSetName } from '@genshin-optimizer/gi/ui'
import { artDisplayValue } from '@genshin-optimizer/gi/util'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import CloseButton from '../../../Components/CloseButton'
import ImgIcon from '../../../Components/Image/ImgIcon'
import { StatWithUnit } from '../../../Components/StatDisplay'
import { WeaponCardNanoObj } from '../../../Components/Weapon/WeaponCardNano'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import { getWeaponSheet } from '../../../Data/Weapons'

export default function BuildTc({
  buildTcId,
  active = false,
}: {
  buildTcId: string
  active: boolean
}) {
  const [open, onOpen, onClose] = useBoolState()
  const { teamCharId } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { name, description } = useBuildTc(buildTcId)
  const onActive = () =>
    database.teamChars.set(teamCharId, {
      buildType: 'tc',
      buildTcId,
    })
  const onRemove = () => {
    //TODO: prompt user for removal
    database.buildTcs.remove(buildTcId)
    // trigger validation
    database.teamChars.set(teamCharId, {})
  }

  return (
    <>
      <ModalWrapper open={open} onClose={onClose}>
        <BuildTcEditor buildTcId={buildTcId} onClose={onClose} />
      </ModalWrapper>
      <CardThemed
        bgt="light"
        sx={{
          undefined,
          boxShadow: active ? '0px 0px 0px 2px green inset' : undefined,
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CardThemed sx={{ flexGrow: 1 }}>
              <CardActionArea disabled={active} onClick={onActive}>
                <Box
                  component="span"
                  sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}
                >
                  <Typography variant="h6">{name}</Typography>
                  <BootstrapTooltip
                    title={<Typography>{description}</Typography>}
                  >
                    <InfoIcon />
                  </BootstrapTooltip>
                </Box>
              </CardActionArea>
            </CardThemed>
            <Button color="info" size="small" onClick={onOpen}>
              <EditIcon />
            </Button>
            <Button color="error" size="small" onClick={onRemove}>
              <DeleteForeverIcon />
            </Button>
          </Box>

          <TcEquip buildTcId={buildTcId} />
        </CardContent>
      </CardThemed>
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
  } = useBuildTc(buildTcId)
  const weaponSheet = getWeaponSheet(weapon.key)
  const substatsArr = Object.entries(substats)
  const substatsArr1 = substatsArr.slice(0, 5)
  const substatsArr2 = substatsArr.slice(5)
  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
      <Grid item xs={1}>
        <WeaponCardNanoObj
          weapon={weapon as ICachedWeapon}
          weaponSheet={weaponSheet}
        />
      </Grid>
      <Grid item xs={2} sm={2} md={2} lg={5}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'stretch',
            height: '100%',
          }}
        >
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
          <CardThemed sx={{ flexGrow: 1 }}>
            <Box
              sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
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
            </Box>
          </CardThemed>
          {[substatsArr1, substatsArr2].map((arr, i) => (
            <CardThemed key={i} sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
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
                      {artDisplayValue(number, unit(sk))}
                      {unit(sk)}
                    </span>
                  </Box>
                ))}
              </Box>
            </CardThemed>
          ))}
        </Box>
      </Grid>
    </Grid>
  )
}

function BuildTcEditor({
  buildTcId,
  onClose,
}: {
  buildTcId: string
  onClose: () => void
}) {
  const database = useDatabase()
  const build = useBuildTc(buildTcId)

  const [name, setName] = useState(build.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(build.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on buildId change, to use the new team's name/desc
  useEffect(() => {
    const { name, description } = database.buildTcs.get(buildTcId)
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
        title="Build Settings"
        action={<CloseButton onClick={onClose} />}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Build Name"
          placeholder="Build Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label="Build Description"
          placeholder="Build Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          multiline
          rows={4}
        />
      </CardContent>
    </CardThemed>
  )
}
