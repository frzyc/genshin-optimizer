import { ListGroup } from "react-bootstrap"
import ConditionalDisplay from "./ConditionalDisplay"
import { DocumentSection } from "../Types/character"
import { ICalculatedStats } from "../Types/stats"
import { evalIfFunc } from "../Util/Util"
import FieldDisplay from "./FieldDisplay"

type SkillDisplayCardProps = {
  sections: DocumentSection[],
  characterDispatch: (any) => void,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats,
  editable: boolean,
}
export default function DocumentDisplay({ sections, characterDispatch, equippedBuild, newBuild, editable }: SkillDisplayCardProps) {
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  return <div className="w-100">{sections?.map((section, i) => {
    if (!section.canShow!(build)) return null
    const talentText = evalIfFunc(section.text, build)
    const fields = section.fields ?? []
    return <div className="my-2" key={"section" + i}>
      <div {...{ xs: 12 }}>
        <div className="mb-2">{talentText}</div>
        {fields.length > 0 && <ListGroup className="text-white mb-2">
          {fields?.map?.((field, i) => <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
        </ListGroup>}
      </div>
      {!!section.conditional && <ConditionalDisplay {...{ conditional: section.conditional, equippedBuild, newBuild, characterDispatch, editable }} />}
    </div>
  })}</div>
}
