import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
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
import {
  CharacterName,
  CharacterSingleSelectionModal,
  ZCard,
} from '@genshin-optimizer/zzz/ui'
import { Button, Grid, Stack } from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useCallback, useState } from 'react'

export function TeammatesSection() {
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const { teammates } = useCharOpt(characterKey)!
  const [show, onShow, onHide] = useBoolState()
  const [teammateIndex, setTeammateIndex] = useState<number | undefined>()
  const setTeammate = useCallback(
    (teammateKey: CharacterKey | null, index?: number) => {
      database.charOpts.setTeammate(characterKey, teammateKey, index)
    },
    [characterKey, database]
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
    <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={show}
          onHide={onHide}
          onSelect={(ck) => setTeammate(ck, teammateIndex)}
          showNone
        />
      </Suspense>
      {range(0, 1).map((i) => (
        <Grid item xs={1} key={i}>
          <Stack gap={1}>
            <Button
              fullWidth
              color={
                (!!teammates[i] && getCharStat(teammates[i]).attribute) ||
                undefined
              }
              onClick={() => {
                setTeammateIndex(i)
                onShow()
              }}
            >
              {(!!teammates[i] && (
                <CharacterName characterKey={teammates[i]} />
              )) ||
                `Add ${i === 0 ? 'First' : 'Second'} Teammate`}
            </Button>
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
