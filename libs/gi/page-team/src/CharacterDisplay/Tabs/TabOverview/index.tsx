import { CardThemed, useScrollRef } from '@genshin-optimizer/common/ui'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import {
  ArtifactCardNano,
  DataContext,
  FieldsDisplay,
  HitModeToggle,
  ReactionToggle,
  StatDisplayComponent,
  WeaponCardNano,
} from '@genshin-optimizer/gi/ui'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import { Box, Grid, Stack } from '@mui/material'
import { useContext, useMemo } from 'react'
import CharacterProfileCard from '../../../CharProfileCard'
import useCompareData from '../../../useCompareData'
import BonusStatsModal from '../../BonusStatsModal'
import CompareBtn from '../../CompareBtn'
import { CustomMultiTargetModal } from '../../CustomMultiTarget/CustomMultiTargetModal'
import EquipmentSection from './EquipmentSection'

export default function TabOverview() {
  const [scrollRef, onScroll] = useScrollRef()

  const data = useContext(DataContext)
  const compareData = useCompareData()
  const dataContextObj = useMemo(
    () => ({
      ...data,
      compareData,
    }),
    [data, compareData]
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
            <CardThemed
              bgt="light"
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
                  BonusStatEditor={BonusStatsModal}
                  CustomMTargetEditor={CustomMultiTargetModal}
                />
              </DataContext.Provider>
            </CardThemed>
          </Grid>
        </Grid>
      </Box>
      <Box ref={scrollRef}>
        <EquipmentSection />
      </Box>
      {data.data.data[0].display?.['custom']?.[0] && (
        <FieldsDisplay
          fields={[
            {
              node: data.data.data[0].display['custom'][0]!,
            },
          ]}
        />
      )}
    </Stack>
  )
}
function EquipmentRow({ onClick }: { onClick: () => void }) {
  const { data } = useContext(DataContext)

  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
      <Grid item xs={1}>
        <CardThemed bgt="light" sx={{ height: '100%', maxHeight: '8em' }}>
          <WeaponCardNano
            weaponId={data.get(input.weapon.id).value}
            onClick={onClick}
          />
        </CardThemed>
      </Grid>
      {allArtifactSlotKeys.map((slotKey) => (
        <Grid item key={slotKey} xs={1}>
          <CardThemed bgt="light" sx={{ height: '100%', maxHeight: '8em' }}>
            <ArtifactCardNano
              artifactId={data.get(input.art[slotKey].id).value?.toString()}
              slotKey={slotKey}
              onClick={onClick}
            />
          </CardThemed>
        </Grid>
      ))}
    </Grid>
  )
}
