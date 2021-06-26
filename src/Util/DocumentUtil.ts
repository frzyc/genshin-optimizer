import { DocumentSection } from "../Types/character";
import { fieldProcessing } from "./FieldUtil";

export function documentSectionsProcessing(sections: DocumentSection[]) {
  sections.forEach(section => {
    if (typeof section.canShow !== "function") section.canShow = () => true
    section.fields?.forEach?.(fieldProcessing)
  })
}