import { SwapHoriz } from "@mui/icons-material"
import { Button, CardContent, Divider, Grid, Typography } from "@mui/material"
import { useContext, useState } from "react"
import Assets from "../Assets/Assets"
import CardDark from "../Components/Card/CardDark"
import CloseButton from "../Components/CloseButton"
import ImgIcon from "../Components/Image/ImgIcon"
import ModalWrapper from "../Components/ModalWrapper"
import WeaponSheet from "../Data/Weapons/WeaponSheet"
import { DatabaseContext } from "../Database/Database"
import usePromise from "../ReactHooks/usePromise"
import { WeaponTypeKey } from "../Types/consts"
import WeaponCard from "./WeaponCard"

export default function WeaponSwapBtn({ onChangeId, weaponTypeKey }: { onChangeId: (id: string) => void, weaponTypeKey: WeaponTypeKey }) {
  const { database } = useContext(DatabaseContext)
  const [show, setShow] = useState(false)
  const open = () => setShow(true)
  const close = () => setShow(false)

  const clickHandler = (id) => {
    onChangeId(id)
    close()
  }

  const weaponSheets = usePromise(WeaponSheet.getAll, [])

  const weaponIdList = database.weapons.keys.filter(wKey => {
    const dbWeapon = database._getWeapon(wKey)
    if (!dbWeapon) return false
    if (weaponTypeKey && weaponTypeKey !== weaponSheets?.[dbWeapon.key]?.weaponType) return false
    return true
  })


  return <>
    <Button color="info" onClick={open} startIcon={<SwapHoriz />} >SWAP WEAPON</Button>
    <ModalWrapper open={show} onClose={close} >
      <CardDark>
        <CardContent sx={{ py: 1 }}>
          <Grid container>
            <Grid item flexGrow={1}>
              <Typography variant="h6">{weaponTypeKey ? <ImgIcon src={Assets.weaponTypes[weaponTypeKey]} /> : null} Swap Weapon</Typography>
            </Grid>
            <Grid item>
              <CloseButton onClick={close} />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardContent>
          <Grid container spacing={1}>
            {weaponIdList.map(weaponId =>
              <Grid item key={weaponId} xs={6} sm={6} md={4} lg={3} >
                <WeaponCard
                  weaponId={weaponId}
                  onClick={clickHandler}
                />
              </Grid>)}
          </Grid>
        </CardContent>
      </CardDark>
    </ModalWrapper>
  </>
}
