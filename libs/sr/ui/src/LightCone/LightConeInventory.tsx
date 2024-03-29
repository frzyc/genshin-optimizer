import { LightConeCard } from './LightConeCard';
import { useDatabaseContext } from '../Context'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { useInfScroll } from '@genshin-optimizer/common/ui'
import { Box, Grid, Skeleton } from '@mui/material';
// import InfiniteScroll from "react-infinite-scroller";
import { useMemo } from 'react';
import { filterFunction } from '@genshin-optimizer/common/util';
import { useForceUpdate, useMediaQueryUp } from '@genshin-optimizer/common/react-util';
import { t } from 'i18next';


//TODO: adapt for light cone
// const WeaponSelectionModal = React.lazy(
//   () => import('../Components/Weapon/WeaponSelectionModal')
// )
// // Lazy load the weapon display
// const WeaponEditor = lazy(() => import('./WeaponEditor'))
// const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const columns = { xs: 6, sm: 6, md: 6, lg: 6, xl: 2 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 10 }

export function LightConeInventory(){
  const { database } = useDatabaseContext();
  const [dbDirty, forceUpdate] = useForceUpdate();
  const { lightConeIds, totalLightConeNum } = useMemo(() => {
    const lightCones = database.lightCones.values
    const totalLightConeNum = lightCones.length
    const lightConeIds = lightCones.map(lightCone => lightCone.id)
    return dbDirty && { lightConeIds, totalLightConeNum };
  }, [
    dbDirty,
    database
  ]);

  const brPt = useMediaQueryUp()

  const totalShowing =
    lightConeIds.length !== totalLightConeNum
      ? `${lightConeIds.length}/${totalLightConeNum}`
      : `${totalLightConeNum}`

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    lightConeIds.length
  )
  const lightConeIdsToShow = useMemo(
    () => lightConeIds.slice(0, numShow),
    [lightConeIds, numShow]
  )

  const showingTextProps = {
    numShowing: lightConeIdsToShow.length,
    total: totalShowing,
  }


  return (
    // <div>
    //   <h1>Light Cone Inventory</h1>
    //   <Grid container spacing={2}>
    //     {database.lightCones.values.map((lightCone: ILightCone) => (
    //         <Grid item xs={3}>
    //           <LightConeCard key={lightCone.key} lightCone={lightCone} />
    //         </Grid>
    //       ))}

    //   </Grid>
    // </div>
    // <Box my={1} display="flex" flexDirection="column" gap={1}>
   // {/* <CardDark>
      //<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> */}
       //</CardContent>/ {/* <Box display="flex" flexWrap="wrap" gap={1} alignItems="stretch"> */}
        //  {/* <WeaponToggle
          //   onChange={(weaponType) =>
          //     database.displayWeapon.set({ weaponType })
          //   }
          //   value={weaponType}
          //   totals={weaponTotals}
          //   size="small"
          // />
          // <WeaponRarityToggle
          //   sx={{ height: '100%' }}
          //   onChange={(rarity) => database.displayWeapon.set({ rarity })}
          //   value={rarity}
          //   totals={weaponRarityTotals}
          //   size="small"
         // /> */}
        //  {/* <Box flexGrow={1} />
        //   <TextField
        //     autoFocus
        //     size="small"
        //     value={searchTerm}
        //     onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
        //       setSearchTerm(e.target.value)
        //     }
        //     label={t('weaponName')}
        //     sx={{ height: '100%' }}
        //     InputProps={{
        //       sx: { height: '100%' },
        //     }}
        //   />
        // </Box>
        // <Box
        //   display="flex"
        //   justifyContent="space-between"
        //   alignItems="center"
        //   flexWrap="wrap"
        // >
        //   <ShowingAndSortOptionSelect
        //     showingTextProps={showingTextProps}
        //     sortByButtonProps={sortByButtonProps}
        //   />
       // </Box> */}
     //{/* </CardContent>
   // </CardDark> */}
   // {/* <Suspense
    //   fallback={
    //     <Skeleton
    //       variant="rectangular"
    //       sx={{ width: '100%', height: '100%', minHeight: 500 }}
    //     />
    //   }
    // > */}
      //{/* <Button
    //     fullWidth
    //     onClick={() => setnewWeaponModalShow(true)}
    //     color="info"
    //     startIcon={<Add />}
    //   >
    //     {t('page_weapon:addWeapon')}
    //   </Button> */}
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 300 }}
        />
      }
    >
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
    >
    <ShowingAndSortOptionSelect
      showingTextProps={showingTextProps}
      sortByButtonProps={sortByButtonProps}
    />
    </Box>
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Grid container spacing={1} columns={columns}>
        {lightConeIdsToShow.map( lightConeId => (
            <Grid item key={lightConeId} xs={1}>
              <LightConeCard lightConeId={lightConeId}/>
            </Grid>
          ))}
      </Grid>

      {lightConeIds.length !== lightConeIdsToShow.length && (
        <Skeleton
          ref={(node) => {
            if (!node) return
            setTriggerElement(node)
          }}
          sx={{ borderRadius: 1 }}
          variant="rectangular"
          width="100%"
          height={100}
        />
      )}
    </Box>
    </Suspense>
  );
};
