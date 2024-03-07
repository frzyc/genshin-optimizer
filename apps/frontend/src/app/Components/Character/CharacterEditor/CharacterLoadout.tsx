import {
  BootstrapTooltip,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { unit } from '@genshin-optimizer/common/util'
import { artifactAsset, weaponAsset } from '@genshin-optimizer/gi/assets'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
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
import { useState } from 'react'
import { getWeaponSheet } from '../../../Data/Weapons'
import ArtifactCardPico from '../../Artifact/ArtifactCardPico'
import SlotIcon from '../../Artifact/SlotIcon'
import ImgIcon from '../../Image/ImgIcon'
import { StatWithUnit } from '../../StatDisplay'
import WeaponCardPico from '../../Weapon/WeaponCardPico'
import WeaponNameTooltip from '../../Weapon/WeaponNameTooltip'

export function CharacterLoadout({ activeCharId }: { activeCharId: string }) {
  const database = useDatabase()
  const artifactSet = database.teamChars.getLoadoutArtifacts(activeCharId)
  const { id: weaponId } = database.teamChars.getLoadoutWeapon(activeCharId)
  const artifacts:
    | false
    | Array<[ArtifactSlotKey, ICachedArtifact | undefined]> =
    !!artifactSet && allArtifactSlotKeys.map((k) => [k, artifactSet[k]])
  const { buildType, buildId, buildTcId } =
    database.teamChars.get(activeCharId)!
  const equippedBuild = buildType === 'equipped'
  const realBuild = buildType === 'real' && database.builds.get(buildId)
  const tcBuild = buildType === 'tc' && database.buildTcs.get(buildTcId)

  return (
    <>
      {!!equippedBuild && (
        <ShowEquipped weaponId={weaponId} artifacts={artifacts} />
      )}
      {!!realBuild && (
        <ShowReal {...realBuild} weaponId={weaponId} artifacts={artifacts} />
      )}
      {!!tcBuild && <ShowTC buildTcId={buildTcId} />}
    </>
  )
}

function ShowEquipped({
  weaponId,
  artifacts,
}: {
  weaponId: string
  artifacts: Array<[ArtifactSlotKey, ICachedArtifact | undefined]>
}) {
  return <ShowReal name="Default" weaponId={weaponId} artifacts={artifacts} />
}

function ShowReal({
  name,
  description,
  weaponId,
  artifacts,
}: {
  name: string
  description?: string
  weaponId: string
  artifacts: Array<[ArtifactSlotKey, ICachedArtifact | undefined]>
}) {
  const [expanded, setExpanded] = useState(false)

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
        <Grid container columns={6} spacing={1}>
          <Grid item xs={2} sm={1} height="100%">
            <WeaponCardPico weaponId={weaponId ?? ''} />
          </Grid>
          {artifacts.map(
            ([key, art]: [ArtifactSlotKey, ICachedArtifact | undefined]) => (
              <Grid item key={key} xs={2} sm={1}>
                <ArtifactCardPico artifactObj={art} slotKey={key} />
              </Grid>
            )
          )}
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
          <Grid item container xs={3} md={1} columns={3}>
            <CardThemed
              sx={{
                p: 1,
                gap: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  justifyContent: 'space-between',
                }}
              >
                <Grid
                  item
                  xs={3}
                  md={1}
                  className={`grad-${weaponSheet.rarity}star`}
                  sx={{
                    display: 'flex',
                    borderRadius: 3,
                  }}
                >
                  <WeaponNameTooltip sheet={weaponSheet}>
                    <Box
                      component="img"
                      src={weaponAsset(weapon.key, weapon.ascension >= 2)}
                      sx={{ maxWidth: '100%' }}
                    />
                  </WeaponNameTooltip>
                </Grid>
              </Box>

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
