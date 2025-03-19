import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { objKeyMap, toggleInArr } from '@genshin-optimizer/common/util'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys, allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useCharOpt, useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { discUiSheets } from '@genshin-optimizer/zzz/formula-ui'
import { DiscSetName, ZCard } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { CharCalcMockCountProvider } from '../CharCalcProvider'

export function DiscSetFilter({
  discBySlot,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  discBySlot: Record<DiscSlotKey, ICachedDisc[]>
  disabled?: boolean
  setFilter4: DiscSetKey[]
  setFilter2: DiscSetKey[]
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
  setSetFilter2: (setFilter2: DiscSetKey[]) => void
}) {
  const character = useCharacterContext()
  const charOpt = useCharOpt(character?.key)
  const discSetBySlot = useMemo(() => {
    const discSetBySlot: Record<
      DiscSetKey,
      Record<DiscSlotKey, number>
    > = objKeyMap(allDiscSetKeys, () => objKeyMap(allDiscSlotKeys, () => 0))

    Object.values(discBySlot).forEach((discs) =>
      discs.forEach(({ setKey, slotKey }) => discSetBySlot[setKey][slotKey]++)
    )

    return discSetBySlot
  }, [discBySlot])
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Disc Set Config
        </Typography>
        <Button disabled={!setFilter4.length} onClick={() => setSetFilter4([])}>
          Reset 4p filter
        </Button>
        <Button disabled={!setFilter2.length} onClick={() => setSetFilter2([])}>
          Reset 2p filter
        </Button>
      </Box>

      <Box>
        {character && charOpt && (
          <CharCalcMockCountProvider
            character={character}
            conditionals={charOpt.conditionals}
          >
            <Grid container spacing={1}>
              {allDiscSetKeys.map((d) => (
                <Grid item key={d} xs={1} md={2} lg={3}>
                  <AdvSetFilterDiscCard
                    numSlot={discSetBySlot[d]}
                    setKey={d}
                    setFilter4={setFilter4}
                    setFilter2={setFilter2}
                    setSetFilter4={setSetFilter4}
                    setSetFilter2={setSetFilter2}
                  />
                </Grid>
              ))}
            </Grid>
          </CharCalcMockCountProvider>
        )}
      </Box>
    </>
  )
}
function AdvSetFilterDiscCard({
  numSlot,
  setKey,
  setFilter4,
  setFilter2,
  setSetFilter4,
  setSetFilter2,
}: {
  numSlot: Record<DiscSlotKey, number>
  setKey: DiscSetKey
  setFilter4: DiscSetKey[]
  setFilter2: DiscSetKey[]
  setSetFilter4: (setFilter4: DiscSetKey[]) => void
  setSetFilter2: (setFilter2: DiscSetKey[]) => void
}) {
  const discSheet = discUiSheets[setKey]
  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<DiscSetName setKey={setKey} />}
        avatar={<ImgIcon src={discDefIcon(setKey)} size={2} />}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-around', pb: 1 }}>
        {Object.entries(numSlot).map(([slotKey, count]) => (
          <Box key={slotKey}>
            <SqBadge color={count ? 'primary' : 'secondary'}>{count}</SqBadge>
          </Box>
        ))}
      </Box>
      <ButtonGroup fullWidth>
        <Button
          sx={{ borderRadius: 0 }}
          color={
            !setFilter4.length || setFilter4.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter4(
              setFilter4.length
                ? toggleInArr([...setFilter4], setKey)
                : [setKey]
            )
          }
        >
          Allow 4p
        </Button>
        <Button
          sx={{ borderRadius: 0 }}
          color={
            !setFilter2.length || setFilter2.includes(setKey)
              ? 'success'
              : 'secondary'
          }
          onClick={() =>
            setSetFilter2(
              setFilter2.length
                ? toggleInArr([...setFilter2], setKey)
                : [setKey]
            )
          }
        >
          Allow 2p
        </Button>
      </ButtonGroup>
      <Stack divider={<Divider />}>
        {Object.entries(discSheet).map(([key, uiSheetElement]) => {
          const setArr = key === '2' ? setFilter2 : setFilter4
          const emphasize = !setArr.length || setArr.includes(setKey)
          return (
            <Box
              key={key}
              sx={{
                opacity: emphasize ? 1 : 0.5,
              }}
            >
              <DiscUiSheetElement uiSheetElement={uiSheetElement} />
            </Box>
          )
        })}
      </Stack>
    </ZCard>
  )
}
function DiscUiSheetElement({
  uiSheetElement,
}: {
  uiSheetElement: UISheetElement
}) {
  const { documents, title } = uiSheetElement
  return (
    <CardContent>
      <Typography variant="subtitle1">{title}</Typography>
      <Stack spacing={1}>
        {documents.map((doc, i) => (
          <DocumentDisplay key={i} document={doc} />
        ))}
      </Stack>
    </CardContent>
  )
}
