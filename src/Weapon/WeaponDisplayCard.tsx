import { Lock, LockOpen, SwapHoriz } from "@mui/icons-material"
import { Box, Button, ButtonGroup, CardContent, Divider, Grid, MenuItem, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import Assets from "../Assets/Assets"
import { buildContext } from "../Build/Build"
import CharacterSheet from "../Character/CharacterSheet"
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import CharacterDropdownButton from "../Components/Character/CharacterDropdownButton"
import CloseButton from "../Components/CloseButton"
import ColorText from "../Components/ColoredText"
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../Components/CustomNumberInput"
import DocumentDisplay from "../Components/DocumentDisplay"
import DropdownButton from "../Components/DropdownMenu/DropdownButton"
import ImgIcon from "../Components/Image/ImgIcon"
import ModalWrapper from "../Components/ModalWrapper"
import SqBadge from "../Components/SqBadge"
import { Stars } from "../Components/StarDisplay"
import WeaponSelectionModal from "../Components/Weapon/WeaponSelectionModal"
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from "../Data/LevelData"
import { database as localDatabase, DatabaseContext } from "../Database/Database"
import useForceUpdate from "../ReactHooks/useForceUpdate"
import usePromise from "../ReactHooks/usePromise"
import { ICachedCharacter } from "../Types/character"
import { CharacterKey } from "../Types/consts"
import { ICalculatedStats } from "../Types/stats"
import { ICachedWeapon } from "../Types/weapon"
import { clamp } from "../Util/Util"
import WeaponCard from "./WeaponCard"
import WeaponSheet from "./WeaponSheet"
import WeaponStatsCard from "./WeaponStatsCard"


type WeaponStatsEditorCardProps = {
  weaponId: string
  charData?: {
    character: ICachedCharacter,
    characterSheet: CharacterSheet,
    equippedBuild?: ICalculatedStats
    newBuild?: ICalculatedStats
    characterDispatch: (any) => void
  }
  footer?: boolean
  onClose?: () => void
}
export default function WeaponDisplayCard({
  weaponId: propWeaponId,
  charData,
  footer = false,
  onClose
}: WeaponStatsEditorCardProps) {
  const database = useContext(DatabaseContext)
  // Use databaseToken anywhere `database._get*` is used
  // Use onDatabaseUpdate when `following` database entries
  const [databaseToken, onDatabaseUpdate] = useForceUpdate()

  const buildContextObj = useContext(buildContext)
  const weapon = useMemo(() =>
    databaseToken && database._getWeapon(propWeaponId!)!,
    [propWeaponId, databaseToken, database])
  const { key, level, refinement, ascension, lock } = weapon
  const { location = "", id } = weapon as Partial<ICachedWeapon>
  const weaponSheet: WeaponSheet | undefined = usePromise(WeaponSheet.get(key), [key])
  const weaponTypeKey = weaponSheet?.weaponType

  useEffect(() =>
    propWeaponId ? database.followWeapon(propWeaponId, onDatabaseUpdate) : undefined,
    [propWeaponId, onDatabaseUpdate, database])

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

  const build = { ...(charData ? (charData.newBuild ?? charData.equippedBuild) : { weapon: { refineIndex: refinement - 1, level, ascension } }) } as any

  const characterSheet = usePromise(location ? CharacterSheet.get(location) : undefined, [location])
  const weaponFilter = characterSheet ? (ws) => ws.weaponType === characterSheet.weaponTypeKey : undefined
  const initialWeaponFilter = characterSheet && characterSheet.weaponTypeKey

  const equipOnChar = useCallback((charKey: CharacterKey | "") => id && database.setWeaponLocation(id, charKey), [database, id])
  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet],
  )
  const [showModal, setshowModal] = useState(false)
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
        {!!charData && database === localDatabase && <Grid item >
          <SwapBtn weaponTypeKey={weaponTypeKey} onChangeId={id => database.setWeaponLocation(id, charData.character.key)} />
        </Grid>}
      </Grid>
    </CardContent>
    <Divider />
    <CardContent >
      {(() => {
        if (!weaponSheet) return null
        const substatKey = weaponSheet.getSubStatKey()
        const weaponDisplayMainVal = weaponSheet.getMainStatValue(level, ascension)
        const weaponDisplaySubVal = weaponSheet.getSubStatValue(level, ascension)
        const weaponPassiveName = weaponSheet.passiveName
        const weaponBonusStats = weaponSheet.stats(build)
        const sections = weaponSheet.document

        return <Grid container spacing={1} >
          <Grid item xs={12} sm={6} md={3} lg={4}>
            <Box component="img" src={weaponSheet.img} className={`grad-${weaponSheet.rarity}star`} sx={{ width: "100%", height: "auto", borderRadius: 1 }} />
            <Typography><small>{weaponSheet.description}</small></Typography>
          </Grid>
          <Grid item sx={{ mb: -1 }} xs={12} sm={6} md={9} lg={8} >
            <Typography variant="h6" >{process.env.NODE_ENV === "development" && <ColorText color="warning">{id || `""`} </ColorText>}{weaponSheet.name} Lv. {WeaponSheet.getLevelString(weapon)} {weaponPassiveName && <SqBadge color="info">Refinement {refinement}</SqBadge>}</Typography>
            <Typography><Stars stars={weaponSheet.rarity} /></Typography>
            <Typography variant="subtitle1">{weaponPassiveName}</Typography>
            <Typography gutterBottom>{weaponPassiveName && weaponSheet.passiveDescription(build)}</Typography>
            {build && <buildContext.Provider value={charData ? buildContextObj : { equippedBuild: build, newBuild: undefined, compareBuild: false, setCompareBuild: undefined }}>
              <WeaponStatsCard title={"Main Stats"} statsVals={{ atk: weaponDisplayMainVal, [substatKey]: substatKey ? weaponDisplaySubVal : undefined }} stats={build} />
              <WeaponStatsCard title={"Bonus Stats"} statsVals={weaponBonusStats} stats={build} />
            </buildContext.Provider>}
            {charData && sections ? (() => {
              const { equippedBuild, newBuild } = charData
              const characterKey = (newBuild ? newBuild : equippedBuild)?.characterKey as CharacterKey | undefined
              return !!characterKey && < DocumentDisplay  {...{ sections, equippedBuild, newBuild, characterKey }} />
            })() : null}
          </Grid>
        </Grid>
      })()}
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

  const weaponSheets = usePromise(WeaponSheet.getAll(), [])

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
              <Grid item key={weaponId} lg={4} md={6} >
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