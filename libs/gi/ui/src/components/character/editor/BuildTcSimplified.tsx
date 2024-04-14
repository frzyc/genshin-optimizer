import { CardThemed, ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useBuildTc } from '@genshin-optimizer/gi/db-ui'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import { artDisplayValue } from '@genshin-optimizer/gi/util'
import { Box, Grid } from '@mui/material'
import { StatWithUnit } from '../../StatDisplay'
import { ArtifactSetName } from '../../artifact'
import { BuildCard } from '../../build'
import { WeaponCardNanoObj } from '../../weapon'

export function BuildTcSimplified({ buildTcId }: { buildTcId: string }) {
  const buildTc = useBuildTc(buildTcId)!
  const { name, description } = buildTc

  return (
    <BuildCard name={name} description={description} hideFooter>
      <TcEquip buildTcId={buildTcId} />
    </BuildCard>
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
  } = useBuildTc(buildTcId)!
  const weaponSheet = getWeaponSheet(weapon.key)
  const substatsArr = Object.entries(substats)
  const substatsArr1 = substatsArr.slice(0, 5)
  const substatsArr2 = substatsArr.slice(5)
  return (
    <Box>
      <Grid
        container
        spacing={1}
        columns={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}
      >
        <Grid item xs={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <WeaponCardNanoObj
              weapon={weapon as ICachedWeapon}
              weaponSheet={weaponSheet}
            />
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
          </Box>
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
