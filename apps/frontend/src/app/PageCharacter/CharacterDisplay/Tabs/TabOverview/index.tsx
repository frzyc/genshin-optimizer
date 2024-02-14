import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { Box, Grid } from '@mui/material'
import { useCallback, useContext, useRef } from 'react'
import ArtifactCardNano from '../../../../Components/Artifact/ArtifactCardNano'
import CardLight from '../../../../Components/Card/CardLight'
import CharacterProfileCard from '../../../../Components/Character/CharacterProfileCard'
import StatDisplayComponent from '../../../../Components/Character/StatDisplayComponent'
import WeaponCardNano from '../../../../Components/Weapon/WeaponCardNano'
import { CharacterContext } from '../../../../Context/CharacterContext'
import { DataContext } from '../../../../Context/DataContext'
import { uiInput as input } from '../../../../Formula'
import EquipmentSection from './EquipmentSection'

export default function TabOverview() {
  const scrollRef = useRef<HTMLDivElement>()
  const onScroll = useCallback(
    () => scrollRef?.current?.scrollIntoView?.({ behavior: 'smooth' }),
    [scrollRef]
  )

  return (
    <Box>
      <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
        <Grid item xs={8} sm={5} md={4} lg={2.3}>
          <CharacterProfileCard />
        </Grid>
        <Grid
          item
          xs={12}
          sm={7}
          md={8}
          lg={9.7}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <EquipmentRow onClick={onScroll} />
          <CardLight sx={{ flexGrow: 1, p: 1 }}>
            <StatDisplayComponent />
          </CardLight>
          <Box ref={scrollRef}>
            <EquipmentSection />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
function EquipmentRow({ onClick }: { onClick: () => void }) {
  const {
    character: { equippedWeapon },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)

  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
      <Grid item xs={1}>
        <WeaponCardNano
          weaponId={equippedWeapon}
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
