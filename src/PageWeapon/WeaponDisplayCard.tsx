import { Lock, LockOpen, SwapHoriz } from "@mui/icons-material"
import { Box, Button, ButtonGroup, CardContent, Divider, Grid, ListItem, MenuItem, Typography } from "@mui/material"
import { useCallback, useContext, useMemo, useState } from "react"
import Assets from "../Assets/Assets"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import CharacterDropdownButton from "../Components/Character/CharacterDropdownButton"
import CloseButton from "../Components/CloseButton"
import ColorText from "../Components/ColoredText"
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../Components/CustomNumberInput"
import DocumentDisplay from "../Components/DocumentDisplay"
import DropdownButton from "../Components/DropdownMenu/DropdownButton"
import { FieldDisplayList, NodeFieldDisplay } from "../Components/FieldDisplay"
import ImgIcon from "../Components/Image/ImgIcon"
import ModalWrapper from "../Components/ModalWrapper"
import SqBadge from "../Components/SqBadge"
import { Stars } from "../Components/StarDisplay"
import WeaponSelectionModal from "../Components/Weapon/WeaponSelectionModal"
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from "../Data/LevelData"
import { database as localDatabase, DatabaseContext } from "../Database/Database"
import { input } from "../Formula"
import { computeUIData, dataObjForWeapon } from "../Formula/api"
import usePromise from "../ReactHooks/usePromise"
import useWeapon from "../ReactHooks/useWeapon"
import { CharacterKey } from "../Types/consts"
import { ICachedWeapon } from "../Types/weapon"
import { clamp } from "../Util/Util"
import WeaponCard from "./WeaponCard"
import WeaponSheet from "../Data/Weapons/WeaponSheet"
import { DataContext } from "../DataContext"

type WeaponStatsEditorCardProps = {
  weaponId: string
  footer?: boolean
  onClose?: () => void
}
export default function WeaponDisplayCard({
  weaponId: propWeaponId,
  footer = false,
  onClose
}: WeaponStatsEditorCardProps) {
  const { data } = useContext(DataContext)

  const database = useContext(DatabaseContext)
  const weapon = useWeapon(propWeaponId)
  const { key = "", level, refinement = 0, ascension = 0, lock, location = "", id } = weapon ?? {}
  const weaponSheet = usePromise(WeaponSheet.get(key), [key])
  const weaponTypeKey = weaponSheet?.weaponType

  const weaponDispatch = useCallback((newWeapon: Partial<ICachedWeapon>) => {
    database.updateWeapon(newWeapon, propWeaponId)
  }, [propWeaponId, database])

  const setLevel = useCallback(level => {
    level = clamp(level, 1, 90)
    const ascension = ascensionMaxLevel.findIndex(ascenML => level <= ascenML)
    weaponDispatch({ level, ascension })
  }, [weaponDispatch])

  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) weaponDispatch({ ascension: ascension + 1 })
    else weaponDispatch({ ascension: lowerAscension })
  }, [weaponDispatch, ascension, level])

  const characterSheet = usePromise(location ? CharacterSheet.get(location) : undefined, [location])
  const weaponFilter = characterSheet ? (ws) => ws.weaponType === characterSheet.weaponTypeKey : undefined
  const initialWeaponFilter = characterSheet && characterSheet.weaponTypeKey

  const equipOnChar = useCallback((charKey: CharacterKey | "") => id && database.setWeaponLocation(id, charKey), [database, id])
  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet],
  )
  const [showModal, setshowModal] = useState(false)
  const img = ascension < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken

  const weaponUIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Grid container spacing={1}>
        <Grid item flexGrow={1}>
          <Grid container spacing={1}>
            <Grid item >
              <WeaponSelectionModal show={showModal} onHide={() => setshowModal(false)} onSelect={k => weaponDispatch({ key: k })} filter={weaponFilter} weaponFilter={initialWeaponFilter} />
              <ButtonGroup>
                <Button onClick={() => setshowModal(true)} >{weaponSheet?.name ?? "Select a Weapon"}</Button>
                <DropdownButton title={`Refinement ${refinement}`}>
                  <MenuItem>Select Weapon Refinement</MenuItem>
                  <Divider />
                  {[...Array(5).keys()].map(key =>
                    <MenuItem key={key} onClick={() => weaponDispatch({ refinement: key + 1 })} selected={refinement === (key + 1)} disabled={refinement === (key + 1)}>
                      {`Refinement ${key + 1}`}
                    </MenuItem>)}
                </DropdownButton>
              </ButtonGroup>
            </Grid>
            <Grid item >
              <ButtonGroup sx={{ bgcolor: t => t.palette.contentLight.main }} >
                <CustomNumberInputButtonGroupWrapper >
                  <CustomNumberInput onChange={setLevel} value={level}
                    startAdornment="Lvl. "
                    inputProps={{ min: 1, max: 90, sx: { textAlign: "center" } }}
                    sx={{ width: "100%", height: "100%", pl: 2 }}
                  />
                </CustomNumberInputButtonGroupWrapper>
                <Button sx={{ pl: 1 }} disabled={!ambiguousLevel(level)} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
                <DropdownButton title={"Select Level"} >
                  {milestoneLevels.map(([lv, as]) => {
                    const sameLevel = lv === ascensionMaxLevel[as]
                    const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
                    const selected = lv === level && as === ascension
                    return <MenuItem key={`${lv}/${as}`} selected={selected} disabled={selected} onClick={() => weaponDispatch({ level: lv, ascension: as })}>{lvlstr}</MenuItem>
                  })}
                </DropdownButton>
              </ButtonGroup>
            </Grid>
            <Grid item>
              <Button color="error" onClick={() => id && database.updateWeapon({ lock: !lock }, id)} startIcon={lock ? <Lock /> : <LockOpen />}>
                {lock ? "Locked" : "Unlocked"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {!!onClose && <Grid item  >
          <CloseButton onClick={onClose} />
        </Grid>}
        {database === localDatabase && <Grid item >
          <SwapBtn weaponTypeKey={weaponTypeKey} onChangeId={id => database.setWeaponLocation(id, data.get(input.charKey).value as CharacterKey)} />
        </Grid>}
      </Grid>
    </CardContent>
    <Divider />
    <CardContent >
      {weaponSheet && weaponUIData && <Box display="flex" gap={{ xs: 1, md: 1.5, lg: 2 }} >
        <Box sx={{ maxWidth: 256 }} flexShrink={1} minWidth="25%">
          <Box component="img" src={img} className={`grad-${weaponSheet.rarity}star`} sx={{ maxWidth: 256, width: "100%", height: "auto", borderRadius: 1 }} />
          <Typography><small>{weaponSheet.description}</small></Typography>
        </Box>
        <Box sx={{ mb: -1 }} flexGrow={1} >
          <Typography variant="h6" >{process.env.NODE_ENV === "development" && <ColorText color="warning">{id || `""`} </ColorText>}{weaponSheet.name} Lv. {weapon && WeaponSheet.getLevelString(weapon)} {weaponSheet.rarity > 2 && <SqBadge color="info">Refinement {refinement}</SqBadge>}</Typography>
          <Typography><Stars stars={weaponSheet.rarity} /></Typography>
          <Typography variant="subtitle1">{weaponSheet.passiveName}</Typography>
          <Typography gutterBottom>{weaponSheet.passiveName && weaponSheet.passiveDescription(weaponUIData.get(input.weapon.refineIndex).value)}</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <CardDark >
              <CardContent>
                <Typography>Main Stats</Typography>
              </CardContent>
              <FieldDisplayList>
                {[input.weapon.main, input.weapon.sub, input.weapon.sub2].map((node, i) => {
                  const n = weaponUIData.get(node)
                  if (n.isEmpty || !n.value) return null
                  return <ListItem key={i}><NodeFieldDisplay node={n} /></ListItem>
                })}
              </FieldDisplayList>
            </CardDark>
            {data && weaponSheet.document && <DocumentDisplay sections={weaponSheet.document} />}
          </Box>
        </Box>
      </Box>}
    </CardContent>
    {footer && id && <CardContent sx={{ py: 1 }}>
      <Grid container>
        <Grid item flexGrow={1}>
          <CharacterDropdownButton noUnselect inventory value={location} onChange={equipOnChar} filter={filter} />
        </Grid>
        {!!onClose && <Grid item><CloseButton large onClick={onClose} /></Grid>}
      </Grid>
    </CardContent>}
  </CardLight>
}
function SwapBtn({ onChangeId, weaponTypeKey }) {
  const database = useContext(DatabaseContext)
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
