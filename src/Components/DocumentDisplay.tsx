import { Box } from "@mui/material"
import { useContext } from "react"
import { buildContext } from "../Build/Build"
import { DocumentSection } from "../Types/character"
import { CharacterKey } from "../Types/consts"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./ConditionalDisplay"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

type SkillDisplayCardProps = {
  sections: DocumentSection[],
  characterKey: CharacterKey,
}
export default function DocumentDisplay({ sections, characterKey }: SkillDisplayCardProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  return <div>{sections?.map((section, i) => {
    if (!section.canShow!(build)) return null
    const talentText = evalIfFunc(section.text, build)
    const fields = section.fields ?? []
    return <Box key={"section" + i} sx={{
      pb: -1,
      "& > *": {
        mb: 1
      }
    }}>
      <div>{talentText}</div>
      {fields.length > 0 && <FieldDisplayList>
        {fields?.map?.((field, i) => <FieldDisplay key={i} field={field} />)}
      </FieldDisplayList>}
      {!!section.conditional && <ConditionalDisplay conditional={section.conditional} characterKey={characterKey} />}
    </Box>
  })}</div>
}
