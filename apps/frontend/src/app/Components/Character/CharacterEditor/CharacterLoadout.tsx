import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { unit } from '@genshin-optimizer/common/util'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactSlotKey,
  CharacterKey,
} from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { type ICachedArtifact } from '@genshin-optimizer/gi/db'
import { useBuildTc, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { ArtifactSetName } from '@genshin-optimizer/gi/ui'
import { artDisplayValue } from '@genshin-optimizer/gi/util'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoIcon from '@mui/icons-material/Info'
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { getWeaponSheet } from '../../../Data/Weapons'
import useCharData from '../../../ReactHooks/useCharData'
import ArtifactCardPico from '../../Artifact/ArtifactCardPico'
import SlotIcon from '../../Artifact/SlotIcon'
import { NodeFieldDisplay } from '../../FieldDisplay'
import ImgIcon from '../../Image/ImgIcon'
import { StatWithUnit } from '../../StatDisplay'
import { WeaponCardNanoObj } from '../../Weapon/WeaponCardNano'
import WeaponCardPico from '../../Weapon/WeaponCardPico'

export function CharacterLoadout({ activeCharId }: { activeCharId: string }) {
  const database = useDatabase()
  const artifactSet = database.teamChars.getLoadoutArtifacts(activeCharId)
  const weapon = database.teamChars.getLoadoutWeapon(activeCharId)
  const artifacts:
    | false
    | Array<[ArtifactSlotKey, ICachedArtifact | undefined]> =
    !!artifactSet && allArtifactSlotKeys.map((k) => [k, artifactSet[k]])
  const {
    buildType,
    buildId,
    buildTcId,
    key: charKey,
  } = database.teamChars.get(activeCharId)!
  const equippedBuild = buildType === 'equipped'
  const realBuild = buildType === 'real' && database.builds.get(buildId)
  const tcBuild = buildType === 'tc' && database.buildTcs.get(buildTcId)

  return (
    <>
      {!!equippedBuild && (
        <ShowEquipped weapon={weapon} artifacts={artifacts} charKey={charKey} />
      )}
      {!!realBuild && (
        <ShowReal
          {...realBuild}
          weapon={weapon}
          artifacts={artifacts}
          charKey={charKey}
        />
      )}
      {!!tcBuild && <ShowTC buildTcId={buildTcId} />}
    </>
  )
}

function ShowEquipped({
  charKey,
  weapon,
  artifacts,
}: {
  charKey: CharacterKey
  weapon: ICachedWeapon
  artifacts: Array<[ArtifactSlotKey, ICachedArtifact | undefined]>
}) {
  return (
    <ShowReal
      name="Default"
      charKey={charKey}
      weapon={weapon}
      artifacts={artifacts}
    />
  )
}

function ShowReal({
  name,
  description,
  charKey,
  weapon,
  artifacts,
}: {
  name: string
  description?: string
  charKey: CharacterKey
  weapon: ICachedWeapon
  artifacts: Array<[ArtifactSlotKey, ICachedArtifact | undefined]>
}) {
  const { id: weaponId } = weapon
  const [expanded, setExpanded] = useState(false)
  const upperRow = ['flower', 'plume']
  const char = useCharData(
    charKey,
    0,
    artifacts.map((a) => a[1]).filter((a) => !!a) as ICachedArtifact[],
    weapon
  )!
  const data = useMemo(() => char[charKey]?.target, [char, charKey])!

  return (
    <CardThemed
      bgt="dark"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        ml: 2,
        mt: 1,
        width: '100%',
      }}
    >
      <LoadoutTitle
        name={name}
        description={description}
        showMore
        onClick={() => setExpanded(!expanded)}
        expanded={expanded}
      />
      <Collapse in={expanded} timeout="auto">
        <Grid container spacing={1} direction="row">
          <Grid item container direction="column" spacing={1} xs={12} md={3}>
            <Grid item container spacing={1} justifyContent="center">
              <Grid item xs={3} md={8}>
                <WeaponCardPico weaponId={weaponId ?? ''} />
              </Grid>
              <Grid item container xs={6} md={4} spacing={1}>
                {artifacts.map(
                  ([key, art]: [
                    ArtifactSlotKey,
                    ICachedArtifact | undefined
                  ]) =>
                    upperRow.includes(key) && (
                      <Grid item key={key} xs={6} md={12}>
                        <ArtifactCardPico artifactObj={art} slotKey={key} />
                      </Grid>
                    )
                )}
              </Grid>
            </Grid>
            <Grid item container spacing={1} justifyContent="center">
              {artifacts.map(
                ([key, art]: [ArtifactSlotKey, ICachedArtifact | undefined]) =>
                  !upperRow.includes(key) && (
                    <Grid item key={key} xs={3} md={4}>
                      <ArtifactCardPico artifactObj={art} slotKey={key} />
                    </Grid>
                  )
              )}
            </Grid>
          </Grid>
          <Grid
            item
            container
            direction="row"
            justifyContent="space-evenly"
            spacing={1}
            xs={12}
            md={9}
          >
            {Object.values(data.getDisplay().basic).map((n) => (
              <Grid item key={JSON.stringify(n.info)} xs={12} md={5}>
                <NodeFieldDisplay node={n} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Collapse>
    </CardThemed>
  )
}

function ShowTC({ buildTcId }: { buildTcId: string }) {
  const {
    weapon,
    artifact: {
      slots,
      substats: { stats: substats },
      sets,
    },
    name,
    description,
  } = useBuildTc(buildTcId)!
  const weaponSheet = getWeaponSheet(weapon.key)
  const substatsArr = Object.entries(substats)
  const [expanded, setExpanded] = useState(false)

  return (
    <CardThemed
      bgt="dark"
      sx={{
        p: 1,
        ml: 2,
        mt: 1,
        width: '100%',
      }}
    >
      <LoadoutTitle
        name={name}
        description={description}
        showMore
        onClick={() => setExpanded(!expanded)}
        expanded={expanded}
      />
      <Collapse in={expanded} timeout="auto">
        <Grid
          container
          columns={3}
          spacing={1}
          direction="row"
          justifyContent="center"
        >
          <Grid
            item
            container
            xs={3}
            md={1}
            columns={3}
            direction="row"
            alignItems="stretch"
            justifyContent="center"
          >
            <CardThemed
              sx={{
                p: 1,
              }}
            >
              <Grid item xs={3} lg={2}>
                <WeaponCardNanoObj
                  weapon={weapon as ICachedWeapon}
                  weaponSheet={weaponSheet}
                />
              </Grid>

              <Grid item xs={3}>
                {!!Object.keys(sets).length &&
                  Object.entries(sets).map(([setKey, number]) => (
                    <Box
                      key={setKey}
                      sx={{
                        p: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        gap: 1,
                      }}
                    >
                      <ImgIcon size={2} src={artifactAsset(setKey, 'flower')} />
                      <span>
                        <ArtifactSetName setKey={setKey} />
                      </span>
                      <SqBadge>x{number}</SqBadge>
                    </Box>
                  ))}
              </Grid>
            </CardThemed>
          </Grid>

          <Grid item container xs={3} md={1} columns={3}>
            <CardThemed
              sx={{
                p: 1,
                gap: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {Object.entries(slots).map(([sk, { level, statKey }]) => (
                <Box
                  key={sk}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <SlotIcon slotKey={sk} />
                  <SqBadge>
                    +{level < 10 ? 0 : ''}
                    {level}
                  </SqBadge>
                  <StatWithUnit statKey={statKey} />
                </Box>
              ))}
            </CardThemed>
          </Grid>

          <Grid item container xs={3} md={1} columns={3}>
            <CardThemed
              sx={{
                p: 1,
                gap: 1,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >
              {substatsArr.map(([sk, number], i) => (
                <Chip
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  avatar={
                    <Avatar>
                      <StatIcon statKey={sk} />
                    </Avatar>
                  }
                  label={
                    <span>
                      {artDisplayValue(number, unit(sk))}
                      {unit(sk)}
                    </span>
                  }
                />
              ))}
            </CardThemed>
          </Grid>
        </Grid>
      </Collapse>
    </CardThemed>
  )
}

function LoadoutTitle({
  name,
  description,
  showMore = false,
  expanded = false,
  onClick,
}: {
  name: string
  description?: string
  showMore?: boolean
  expanded?: boolean
  onClick?: () => void
}) {
  return (
    <Typography
      sx={{
        gap: 1,
        px: 1,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <span>{name}</span>{' '}
      {!!description && (
        <BootstrapTooltip title={<Typography>{description}</Typography>}>
          <InfoIcon />
        </BootstrapTooltip>
      )}
      {showMore && (
        <IconButton
          onClick={onClick}
          sx={{
            marginLeft: 'auto',
            transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      )}
    </Typography>
  )
}
