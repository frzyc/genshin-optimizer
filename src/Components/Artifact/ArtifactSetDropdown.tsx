import { Replay } from "@mui/icons-material";
import { ButtonProps, Divider, ListItemIcon, ListItemText, MenuItem, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ArtifactSheet } from "../../Artifact/ArtifactSheet";
import usePromise from "../../ReactHooks/usePromise";
import { ArtifactRarity, ArtifactSetKey, Rarity } from "../../Types/consts";
import DropdownButton from "../DropdownMenu/DropdownButton";
import ImgIcon from "../Image/ImgIcon";
import { Stars } from "../StarDisplay";

type props = Omit<ButtonProps, "onChange"> & {
  selectedSetKey?: ArtifactSetKey | ""
  onChange: (setKey: ArtifactSetKey | "") => void
  hasUnselect?: boolean
  artifactSetsByRarity?: { [rarity in ArtifactRarity]: ArtifactSetKey[] }
}
export default function ArtifactSetDropdown({ selectedSetKey = "", onChange, artifactSetsByRarity, hasUnselect = false, ...props }: props) {
  const { t } = useTranslation("artifact")
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const sheet = artifactSheets?.[selectedSetKey]
  const displaySets = useMemo(() => {
    if (artifactSetsByRarity) return artifactSetsByRarity
    if (!artifactSheets) return {}
    return ArtifactSheet.setKeysByRarities(artifactSheets)
  }, [artifactSheets, artifactSetsByRarity])
  return <DropdownButton
    {...props}
    title={sheet?.name ?? t`editor.set.artifactSet`}
    startIcon={sheet?.defIconSrc && <ImgIcon src={sheet?.defIconSrc} />}
    color={sheet ? "success" : "primary"}
  >
    {hasUnselect && <MenuItem onClick={() => onChange("")} selected={selectedSetKey === ""} disabled={selectedSetKey === ""}>
      <ListItemIcon>
        <Replay />
      </ListItemIcon>
      <ListItemText>
        <Trans t={t} i18nKey="ui:unselect" >Unselect</Trans>
      </ListItemText>
    </MenuItem >}
    {!!Object.keys(displaySets).length && Object.entries(displaySets).reverse().flatMap(([star, sets], i) => [
      ...(((i > 0) || hasUnselect) && sets.length ? [<Divider key={`${star}divi`} />] : []),
      ...(sets.length ? [<MenuItem key={`${star}header`} >
        <Typography>
          <Trans t={t} i18nKey="editor.set.maxRarity">Max Rarity <Stars stars={parseInt(star) as Rarity} /></Trans>
        </Typography>
      </MenuItem>] : []),
      ...sets.map(setKey => <MenuItem key={setKey} onClick={() => onChange(setKey)} selected={selectedSetKey === setKey} disabled={selectedSetKey === setKey}>
        <ListItemIcon>
          <ImgIcon src={artifactSheets?.[setKey]?.defIconSrc} sx={{ fontSize: "1.5em" }} />
        </ListItemIcon>
        <ListItemText>
          {artifactSheets?.[setKey]?.name}
        </ListItemText>
      </MenuItem >)
    ])}
  </DropdownButton>
}