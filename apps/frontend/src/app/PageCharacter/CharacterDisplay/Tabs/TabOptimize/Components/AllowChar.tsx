import { allArtifactSlotKeys, charKeyToLocCharKey, LocationCharacterKey, LocationKey } from "@genshin-optimizer/consts";
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';
import { Box, Button, CardActionArea, CardContent, Divider, Grid, Typography } from "@mui/material";
import { MouseEvent, useCallback, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import SlotIcon from "../../../../../Components/Artifact/SlotIcon";
import CardDark from "../../../../../Components/Card/CardDark";
import CardLight from "../../../../../Components/Card/CardLight";
import CharacterCardPico from "../../../../../Components/Character/CharacterCardPico";
import CloseButton from "../../../../../Components/CloseButton";
import ModalWrapper from "../../../../../Components/ModalWrapper";
import SqBadge from "../../../../../Components/SqBadge";
import { CharacterContext } from "../../../../../Context/CharacterContext";
import { DatabaseContext } from "../../../../../Database/Database";
import useBoolState from "../../../../../ReactHooks/useBoolState";
import useForceUpdate from "../../../../../ReactHooks/useForceUpdate";
import useBuildSetting from "../useBuildSetting";
export default function AllowChar({ disabled = false, numArtsEquippedUsed }: { disabled?: boolean, numArtsEquippedUsed: number }) {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting: { allowLocations }, buildSettingDispatch } = useBuildSetting(characterKey)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const deferredDbDirty = useDeferredValue(dbDirty)

  useEffect(() => database.charMeta.followAny(s => forceUpdate()), [forceUpdate, database])
  useEffect(() => database.chars.followAny(s => forceUpdate()), [forceUpdate, database])

  const [shouldClearList, setShouldClearList] = useState(false)

  const locList = useMemo(() => deferredDbDirty && Array.from(new Set(
    Object.entries(database.chars.data)
      .filter(([ck]) => ck !== characterKey)
      .sort(([ck1, c1], [ck2, c2]) => {
        // sort characters by: star => more artifacts equipped
        const [choosec1, choosec2] = [-1, 1]
        const c1f = database.charMeta.get(ck1).favorite
        const c2f = database.charMeta.get(ck2).favorite
        if (c1f && !c2f) return choosec1
        else if (c2f && !c1f) return choosec2

        const art1 = Object.values(c1.equippedArtifacts).filter(id => id).length
        const art2 = Object.values(c2.equippedArtifacts).filter(id => id).length
        if (art1 > art2) return choosec1
        else if (art2 > art1) return choosec2
        return ck1.localeCompare(ck2)

      }).map(([k]) => charKeyToLocCharKey(k))))
    , [deferredDbDirty, characterKey, database])

  const allowAll = useCallback(() => buildSettingDispatch({ allowLocations: [...locList] }), [buildSettingDispatch, locList])
  const disallowAll = useCallback(() => buildSettingDispatch({ allowLocations: [] }), [buildSettingDispatch])

  const toggleList = useCallback((lkList: Set<LocationKey>) => {
    const lkArray = [...lkList]
    const newAllowLocations = lkArray
      .filter(lk => !allowLocations.includes(lk))
      .concat(allowLocations.filter(lk => !lkArray.includes(lk)))
    buildSettingDispatch({ allowLocations: newAllowLocations })
  }, [allowLocations, buildSettingDispatch])

  const total = locList.length
  const useTot = allowLocations.length

  return <Box display="flex" gap={1} onMouseUp={() => setShouldClearList(true)} onTouchEnd={() => setShouldClearList(true)}>
    <ModalWrapper open={show} onClose={onClose} containerProps={{ maxWidth: "xl" }}><CardDark>
      <CardContent>
        <Box display="flex" gap={1} >
          <Typography variant="h6" flexGrow={1}>{t`excludeChar.title`}</Typography>
          <CloseButton onClick={onClose} size="small" />
        </Box>
      </CardContent>
      <Divider />
      <CardContent>
        <Box pb={1} display="flex" gap={1} flexWrap="wrap">
          <Button color="success" sx={{ flexGrow: 1 }} onClick={allowAll} >
            {t`excludeChar.modal.allow_all`}
            <SqBadge sx={{ ml: 1 }}><strong>{`${useTot}/${total}`}</strong></SqBadge>
          </Button>
          <Button color="error" sx={{ flexGrow: 1 }} onClick={disallowAll} >
            {t`excludeChar.modal.disallow_All`}
            <SqBadge sx={{ ml: 1 }}><strong>{`${total - useTot}/${total}`}</strong></SqBadge>
          </Button>
        </Box>
        <SelectItemGrid locList={locList} allowLocations={allowLocations} shouldClearList={shouldClearList} setShouldClearList={setShouldClearList} toggleList={toggleList} />
      </CardContent>
    </CardDark ></ModalWrapper>
    <Button sx={{ flexGrow: 1 }} color="info" onClick={onOpen} disabled={disabled} startIcon={<SettingsAccessibilityIcon />} >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <span>{t`excludeChar.title`}</span>
        <SqBadge sx={{ whiteSpace: "normal" }}><Trans t={t} i18nKey="excludeChar.usingNumTot" count={useTot} arts={numArtsEquippedUsed}>Using <strong>{{ arts: numArtsEquippedUsed } as TransObject}</strong> artifacts from <strong>{{ count: useTot } as TransObject}</strong> characters</Trans></SqBadge>
      </Box>
    </Button>
  </Box >
}

function SelectItemGrid({ locList, allowLocations, shouldClearList, setShouldClearList, toggleList }: {
  locList: LocationCharacterKey[]
  allowLocations: LocationKey[]
  shouldClearList: boolean
  setShouldClearList: (v: boolean) => void
  toggleList: (charList: Set<LocationCharacterKey>) => void
}) {
  const [charList, setCharList] = useState(new Set<LocationCharacterKey>())
  useEffect(() => {
    if (shouldClearList) {
      toggleList(charList)
      setCharList(new Set<LocationCharacterKey>())
      setShouldClearList(false)
    }
  }, [charList, setCharList, setShouldClearList, shouldClearList, toggleList])
  return <Grid container spacing={1} columns={{ xs: 6, sm: 7, md: 10, lg: 12, xl: 16 }}>
    {locList.map((lk) =>
      <Grid item key={lk} xs={1}>
        <SelectItem locKey={lk} charList={charList} setCharList={setCharList} selected={allowLocations.includes(lk)} />
      </Grid>
    )}
  </Grid>
}

function SelectItem({ locKey, selected, charList, setCharList }: {
  locKey: LocationCharacterKey
  selected: boolean
  charList: Set<LocationCharacterKey>
  setCharList: (list: Set<LocationCharacterKey>) => void
}) {
  const { database } = useContext(DatabaseContext)
  const char = database.chars.get(database.chars.LocationToCharacterKey(locKey))
  const onMouseEnter = useCallback((e: MouseEvent) => e.buttons === 1 && setCharList((new Set([...charList])).add(locKey)), [charList, setCharList, locKey])
  const onMouseDown = useCallback(() => setCharList((new Set([...charList])).add(locKey)), [charList, setCharList, locKey])
  const sx = {
    opacity: charList.has(locKey) ? 0.3 : (selected ? undefined : 0.6),
    borderColor: selected ? "rgb(100,200,100)" : "rgb(200,100,100)",
    borderWidth: "3px",
    borderStyle: "solid",
    borderRadius: "8px",
  }
  const content = useMemo(() => <>
    <CharacterCardPico characterKey={database.chars.LocationToCharacterKey(locKey)} />
    <Box fontSize="0.85em" display="flex" justifyContent="space-between" p={0.3} >
      {allArtifactSlotKeys.map(s => <SlotIcon key={s} slotKey={s} iconProps={{ fontSize: "inherit", sx: { opacity: char?.equippedArtifacts[s] ? undefined : 0.5 } }} />)}
    </Box>
  </>,
    [char?.equippedArtifacts, database.chars, locKey]
  )
  return <CardActionArea onMouseEnter={onMouseEnter} onMouseDown={onMouseDown} >
    <CardLight sx={sx}>
      {content}
    </CardLight>
  </CardActionArea>
}
