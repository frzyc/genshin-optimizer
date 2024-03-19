import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { Box, Grid, Stack } from '@mui/material'
import { useCallback, useContext, useMemo, useRef } from 'react'
import ArtifactCardNano from '../../../../Components/Artifact/ArtifactCardNano'
import CardLight from '../../../../Components/Card/CardLight'
import StatDisplayComponent from '../../../../Components/Character/StatDisplayComponent'
import {
  HitModeToggle,
  ReactionToggle,
} from '../../../../Components/HitModeEditor'
import WeaponCardNano from '../../../../Components/Weapon/WeaponCardNano'
import { DataContext } from '../../../../Context/DataContext'
import { uiInput as input } from '../../../../Formula'
import CharacterProfileCard from '../../../CharProfileCard'
import useOldData from '../../../useOldData'
import CompareBtn from '../../CompareBtn'
import EquipmentSection from './EquipmentSection'

export default function TabOverview() {
  const scrollRef = useRef<HTMLDivElement>()
  const onScroll = useCallback(
    () => scrollRef?.current?.scrollIntoView?.({ behavior: 'smooth' }),
    [scrollRef]
  )

  const data = useContext(DataContext)
  const oldData = useOldData()
  const dataContextObj = useMemo(
    () => ({
      ...data,
      oldData,
    }),
    [data, oldData]
  )
  return (
    <Stack spacing={1}>
      <Box>
        <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
          <Grid item xs={8} sm={8} md={3} lg={2.3}>
            <CharacterProfileCard />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={9}
            lg={9.7}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <EquipmentRow onClick={onScroll} />
            <CardLight
              sx={{
                flexGrow: 1,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <HitModeToggle size="small" />
                <ReactionToggle size="small" />
                <CompareBtn buttonGroupProps={{ sx: { marginLeft: 'auto' } }} />
              </Box>
              <DataContext.Provider value={dataContextObj}>
                <StatDisplayComponent
                  columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                />
              </DataContext.Provider>
            </CardLight>
          </Grid>
        </Grid>
      </Box>
      <Box ref={scrollRef}>
        <EquipmentSection />
      </Box>
    </Stack>
  )
}
function EquipmentRow({ onClick }: { onClick: () => void }) {
  const { data } = useContext(DataContext)

  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
      <Grid item xs={1}>
        <WeaponCardNano
          weaponId={data.get(input.weapon.id).value}
          BGComponent={CardLight}
          onClick={onClick}
        />
      </Grid>
      {allArtifactSlotKeys.map((slotKey) => (
        <Grid item key={slotKey} xs={1}>
          <ArtifactCardNano
            artifactId={data.get(input.art[slotKey].id).value?.toString()}
            slotKey={slotKey}
            BGComponent={CardLight}
            onClick={onClick}
          />
        </Grid>
      ))}
    </Grid>
  )
}
