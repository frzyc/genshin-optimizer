import React from "react"
import { Dropdown } from "react-bootstrap"
import { Trans, useTranslation } from "react-i18next"
import { Stars } from "../../Components/StarDisplay"
import { ArtifactSetKey, Rarity } from "../../Types/consts"
import { ArtifactSheet } from "../ArtifactSheet"
type Data = {
  sheets?: StrictDict<ArtifactSetKey, ArtifactSheet>
  click: (ArtifactSetKey) => void
}
export default function ArtifactSetDropDownMenuFragment({ sheets, click }: Data) {
  const { t } = useTranslation("artifact")
  return <React.Fragment>
    {sheets && Object.entries(ArtifactSheet.setKeysByRarities(sheets)).reverse().map(([star, sets], i) =>
      <React.Fragment key={star}>
        {i > 0 && <Dropdown.Divider />}
        <Dropdown.Header><Trans t={t} i18nKey="editor.set.maxRarity">Max Rarity <Stars stars={parseInt(star) as Rarity} /></Trans></Dropdown.Header>
        {sets.map(setKey => <Dropdown.Item key={setKey} onClick={() => click(setKey)}>{sheets[setKey].name}</Dropdown.Item >)}
      </React.Fragment>)}
  </React.Fragment>
}
