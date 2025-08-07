import {
  CardThemed,
  DropdownButton,
  ImgIcon,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  factionDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'

import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { allStats, getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { CharacterName, ZCard } from '@genshin-optimizer/zzz/ui'
import { Grid, MenuItem, Stack } from '@mui/material'
import { Box } from '@mui/system'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function TeammatesSection() {
  const { t } = useTranslation('page_optimize')
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const { teammates } = useCharOpt(characterKey)!
  const setTeammate = useCallback(
    (teammateKey: CharacterKey | null, index?: number) =>
      database.charOpts.setTeammate(characterKey, teammateKey, index),
    [characterKey, database]
  )
  const allChars = useMemo(
    () =>
      database.chars.keys.filter(
        (charKey) => !teammates.includes(charKey) && charKey !== characterKey
      ),
    [characterKey, database, teammates]
  )
  const icons = useCallback(
    (charKey: CharacterKey | undefined) =>
      charKey
        ? [
            characterAsset(charKey, 'interknot'),
            specialityDefIcon(allStats.char[charKey]?.specialty),
            factionDefIcon(allStats.char[charKey]?.faction),
          ]
        : [],
    []
  )

  return (
    <Grid container spacing={1} columns={{ xs: 1, sm: 1, md: 2 }}>
      <Grid item xs={1}>
        <Stack gap={1}>
          <DropdownButton
            fullWidth
            color={
              (!!teammates[0] && getCharStat(teammates[0]).attribute) ||
              undefined
            }
            title={
              (!!teammates[0] && (
                <CharacterName characterKey={teammates[0]} />
              )) ||
              'Add First Teammate'
            }
          >
            <MenuItem onClick={() => setTeammate(null, 0)}>
              {t('removeTeammate')}
            </MenuItem>
            {allChars.map((charKey) => (
              <MenuItem onClick={() => setTeammate(charKey, 0)}>
                {<CharacterName characterKey={charKey} />}
              </MenuItem>
            ))}
          </DropdownButton>
          {!!teammates[0] && (
            <ZCard bgt="dark">
              <Grid
                container
                sx={{ height: '100px', padding: 0.5 }}
                columns={4}
                spacing={0.5}
              >
                {range(0, 2).map((icon) => (
                  <Grid item xs={1} key={icon}>
                    <TeammateIconCard>
                      <ImgIcon size={5} src={icons(teammates[0])?.[icon]} />
                    </TeammateIconCard>
                  </Grid>
                ))}
                <Grid item xs={1}>
                  <TeammateIconCard>
                    <ElementIcon
                      ele={getCharStat(teammates[0])?.attribute}
                      iconProps={{ sx: { width: '2.5em', height: '2.5em' } }}
                    />
                  </TeammateIconCard>
                </Grid>
              </Grid>
            </ZCard>
          )}
        </Stack>
      </Grid>
      <Grid item xs={1}>
        <Stack gap={1}>
          <DropdownButton
            fullWidth
            color={
              (!!teammates[1] && getCharStat(teammates[1]).attribute) ||
              undefined
            }
            title={
              (!!teammates[1] && (
                <CharacterName characterKey={teammates[1]} />
              )) ||
              'Add Second Teammate'
            }
          >
            <MenuItem onClick={() => setTeammate(null, 1)}>
              {t('removeTeammate')}
            </MenuItem>
            {allChars.map((charKey) => (
              <MenuItem onClick={() => setTeammate(charKey, 1)}>
                {<CharacterName characterKey={charKey} />}
              </MenuItem>
            ))}
          </DropdownButton>
          {!!teammates[1] && (
            <ZCard
              bgt="dark"
              sx={{
                border: `3px solid ${getCharStat(teammates[1])?.attribute}`,
              }}
            >
              <Grid
                container
                sx={{ height: '100px', padding: 0.5 }}
                columns={4}
                spacing={0.5}
              >
                {range(0, 2).map((icon) => (
                  <Grid item xs={1} key={icon}>
                    <TeammateIconCard>
                      <ImgIcon size={5} src={icons(teammates[1])?.[icon]} />
                    </TeammateIconCard>
                  </Grid>
                ))}
                <Grid item xs={1}>
                  <TeammateIconCard>
                    <ElementIcon
                      ele={getCharStat(teammates[1])?.attribute}
                      iconProps={{ sx: { width: '2.5em', height: '2.5em' } }}
                    />
                  </TeammateIconCard>
                </Grid>
              </Grid>
            </ZCard>
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}

function TeammateIconCard({ children }: { children?: React.ReactNode }) {
  return (
    <CardThemed
      bgt="light"
      sx={{
        height: '100%',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          padding: 0.5,
          display: 'flex',
          justifyContent: 'center',
          height: '100%',
          alignItems: 'center',
        }}
      >
        {children}
      </Box>
    </CardThemed>
  )
}
