import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Lock, LockOpen } from "@mui/icons-material"
import { Box, Button, ButtonGroup, CardActionArea, CardContent, CardHeader, IconButton, Skeleton, Tooltip, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import Assets from "../Assets/Assets"
import CardLight from "../Components/Card/CardLight"
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton'
import LocationName from "../Components/Character/LocationName"
import ConditionalWrapper from "../Components/ConditionalWrapper"
import ImgIcon from "../Components/Image/ImgIcon"
import { Stars } from "../Components/StarDisplay"
import StatIcon from "../Components/StatIcon"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import { ascensionMaxLevel } from "../Data/LevelData"
import WeaponSheet from "../Data/Weapons/WeaponSheet"
import { DatabaseContext } from "../Database/Database"
import { uiInput as input } from "../Formula"
import { computeUIData, dataObjForWeapon } from "../Formula/api"
import KeyMap, { valueString } from "../KeyMap"
import usePromise from "../ReactHooks/usePromise"
import useWeapon from "../ReactHooks/useWeapon"
import { CharacterKey } from "../Types/consts"

type WeaponCardProps = { weaponId: string, onClick?: (weaponId: string) => void, onEdit?: (weaponId: string) => void, onDelete?: (weaponId: string) => void, canEquip?: boolean, extraButtons?: JSX.Element }
export default function WeaponCard({ weaponId, onClick, onEdit, onDelete, canEquip = false, extraButtons }: WeaponCardProps) {
  const { t } = useTranslation(["page_weapon"]);
  const { database } = useContext(DatabaseContext)
  const databaseWeapon = useWeapon(weaponId)
  const weapon = databaseWeapon
  const weaponSheet = usePromise(weapon?.key ? WeaponSheet.get(weapon.key) : undefined, [weapon?.key])

  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet],
  )

  const wrapperFunc = useCallback(children => <CardActionArea onClick={() => onClick?.(weaponId)} >{children}</CardActionArea>, [onClick, weaponId],)
  const falseWrapperFunc = useCallback(children => <Box >{children}</Box>, [])

  const equipOnChar = useCallback((charKey: CharacterKey | "") => database.setWeaponLocation(weaponId, charKey), [database, weaponId],)

  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])

  if (!weapon || !weaponSheet || !UIData) return null;
  const { level, ascension, refinement, id, location = "", lock } = weapon
  const weaponTypeKey = UIData.get(input.weapon.type).value!
  const stats = [input.weapon.main, input.weapon.sub, input.weapon.sub2].map(x => UIData.get(x))
  const img = ascension < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken

  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 300 }} />}>
    <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <ConditionalWrapper condition={!!onClick} wrapper={wrapperFunc} falseWrapper={falseWrapperFunc}>
        <Box className={`grad-${weaponSheet.rarity}star`} sx={{ position: "relative" }}>
          {!onClick && <IconButton color="primary" onClick={() => database.updateWeapon({ lock: !lock }, id)} sx={{ position: "absolute", right: 0, bottom: 0, zIndex: 2 }}>
            {lock ? <Lock /> : <LockOpen />}
          </IconButton>}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <CardHeader sx={{ pb: 1 }} title={weaponSheet.name} avatar={<ImgIcon sx={{ fontSize: "1.5em" }} src={Assets.weaponTypes?.[weaponTypeKey]} />} titleTypographyProps={{ variant: "subtitle1" }} />
            <Box sx={{ px: 2, }}>
              <Typography component="span" variant="h5">Lv. {level}</Typography>
              <Typography component="span" variant="h5" color="text.secondary">/{ascensionMaxLevel[ascension]}</Typography>
              <Typography variant="h6">Refinement <strong>{refinement}</strong></Typography>
              <Typography><Stars stars={weaponSheet.rarity} colored /></Typography>
            </Box>
          </Box>
          <Box sx={{ height: "100%", position: "absolute", right: 0, top: 0 }}>
            <Box
              component="img"
              src={img ?? ""}
              width="auto"
              height="100%"
              sx={{ float: "right" }}
            />
          </Box>
        </Box>
        <CardContent>
          {stats.map(node => {
            if (!node.info.key) return null
            const displayVal = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
            return <Box key={node.info.key} sx={{ display: "flex" }}>
              <Typography flexGrow={1}>{StatIcon[node.info.key!]} {KeyMap.get(node.info.key)}</Typography>
              <Typography>{displayVal}</Typography>
            </Box>
          })}
        </CardContent>
      </ConditionalWrapper>
      <Box sx={{ p: 1, display: "flex", gap: 1, justifyContent: "space-between", alignItems: "center" }}>
        {canEquip ? <CharacterDropdownButton size="small" noUnselect inventory value={location} onChange={equipOnChar} filter={filter} /> : <LocationName location={location} />}
        <ButtonGroup>
          {!!onEdit && <Tooltip title={<Typography>{t`edit`}</Typography>} placement="top" arrow>
            <Button color="info" onClick={() => onEdit(id)} >
              <FontAwesomeIcon icon={faEdit} className="fa-fw" />
            </Button>
          </Tooltip>}
          {!!onDelete && <Button color="error" onClick={() => onDelete(id)} disabled={!!location || lock} >
            <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
          </Button>}
          {extraButtons}
        </ButtonGroup>
      </Box>
    </CardLight>
  </Suspense>
}
