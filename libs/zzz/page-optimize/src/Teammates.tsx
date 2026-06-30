import { CardThemed, ImgIcon } from '@genshin-optimizer/common-ui'
import { range } from '@genshin-optimizer/common-util'
import {
  characterAsset,
  factionDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz-assets'

import type { CharacterKey } from '@genshin-optimizer/zzz-consts'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz-db-ui'
import { allStats, getCharStat } from '@genshin-optimizer/zzz-stats'
import { ElementIcon } from '@genshin-optimizer/zzz-svgicons'
import {
  CharacterName,
  CharacterSingleSelectionModal,
  ZCard,
} from '@genshin-optimizer/zzz-ui'
import { Button, Grid, Stack } from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useCallback, useState } from 'react'

const EXTRA_TEAMMATE_SLOTS = [1, 2] as const

export function TeammatesSection() {
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const team = useTeam(characterKey)!
  const [pickingSlot, setPickingSlot] = useState<1 | 2>()
  const setTeammate = useCallback(
    (teammateKey: CharacterKey | null, slot: 1 | 2) => {
      database.teams.setTeammate(characterKey, teammateKey, slot - 1)
    },
    [characterKey, database.teams]
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
          show={pickingSlot !== undefined}
          onHide={() => setPickingSlot(undefined)}
          onSelect={(ck) => {
            if (pickingSlot) setTeammate(ck, pickingSlot)
            setPickingSlot(undefined)
          }}
          showNone
        />
      </Suspense>
      {EXTRA_TEAMMATE_SLOTS.map((slot) => {
        const teammateKey = team.teammates[slot]?.characterKey
        return (
          <Grid item xs={1} key={slot}>
            <Stack gap={1}>
              <Button
                fullWidth
                color={
                  (teammateKey && getCharStat(teammateKey).attribute) ||
                  undefined
                }
                onClick={() => setPickingSlot(slot)}
              >
                {(teammateKey && (
                  <CharacterName characterKey={teammateKey} />
                )) ||
                  `Add ${slot === 1 ? 'First' : 'Second'} Teammate`}
              </Button>
              {teammateKey && (
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
                          <ImgIcon size={5} src={icons(teammateKey)?.[icon]} />
                        </TeammateIconCard>
                      </Grid>
                    ))}
                    <Grid item xs={1}>
                      <TeammateIconCard>
                        <ElementIcon
                          ele={getCharStat(teammateKey)?.attribute}
                          iconProps={{
                            sx: { width: '2.5em', height: '2.5em' },
                          }}
                        />
                      </TeammateIconCard>
                    </Grid>
                  </Grid>
                </ZCard>
              )}
            </Stack>
          </Grid>
        )
      })}
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
