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
      {range(0, 1).map((i) => (
        <Grid item xs={1} key={i}>
          <Stack gap={1}>
            <DropdownButton
              fullWidth
              color={
                (!!teammates[i] && getCharStat(teammates[i]).attribute) ||
                undefined
              }
              title={
                (!!teammates[i] && (
                  <CharacterName characterKey={teammates[i]} />
                )) ||
                `Add ${i === 0 ? 'First' : 'Second'} Teammate`
              }
            >
              <MenuItem onClick={() => setTeammate(null, i)}>
                {t('removeTeammate')}
              </MenuItem>
              {allChars.map((charKey) => (
                <MenuItem onClick={() => setTeammate(charKey, i)} key={charKey}>
                  {<CharacterName characterKey={charKey} />}
                </MenuItem>
              ))}
            </DropdownButton>
            {!!teammates[i] && (
              <ZCard bgt="dark">
                <Grid
                  container
                  sx={{ display: 'flex', padding: 0.5 }}
                  columns={{ xs: 2, lg: 4 }}
                  spacing={0.5}
                >
                  {range(0, 2).map((icon) => (
                    <Grid item xs={1} key={icon} height="90px">
                      <TeammateIconCard>
                        <ImgIcon size={5} src={icons(teammates[i])?.[icon]} />
                      </TeammateIconCard>
                    </Grid>
                  ))}
                  <Grid item xs={1}>
                    <TeammateIconCard>
                      <ElementIcon
                        ele={getCharStat(teammates[i])?.attribute}
                        iconProps={{ sx: { width: '2.5em', height: '2.5em' } }}
                      />
                    </TeammateIconCard>
                  </Grid>
                </Grid>
              </ZCard>
            )}
          </Stack>
        </Grid>
      ))}
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
