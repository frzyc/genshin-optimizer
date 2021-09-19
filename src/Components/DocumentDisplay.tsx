import { useContext } from "react"
import { ListGroup } from "react-bootstrap"
import { buildContext } from "../Build/Build"
import { DocumentSection } from "../Types/character"
import { CharacterKey } from "../Types/consts"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./ConditionalDisplay"
import FieldDisplay from "./FieldDisplay"

type SkillDisplayCardProps = {
  sections: DocumentSection[],
  characterKey: CharacterKey,
}
export default function DocumentDisplay({ sections, characterKey }: SkillDisplayCardProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  return <div className="w-100">{sections?.map((section, i) => {
    if (!section.canShow!(build)) return null
    const talentText = evalIfFunc(section.text, build)
    const fields = section.fields ?? []
    return <div className="my-2" key={"section" + i}>
      <div>
        <div className="mb-2">{talentText}</div>
        {fields.length > 0 && <ListGroup className="text-white mb-2">
          {fields?.map?.((field, i) => <FieldDisplay key={i} index={i} field={field} />)}
        </ListGroup>}
      </div>
      {!!section.conditional && <ConditionalDisplay conditional={section.conditional} characterKey={characterKey} />}
    </div>
  })}</div>
}
