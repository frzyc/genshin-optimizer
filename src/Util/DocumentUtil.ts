import { DocumentSection } from "../Types/character";
import { fieldProcessing } from "./FieldUtil";

export function documentProcessing(document: DocumentSection[]) {
  document.forEach(section => {
    if (typeof section.canShow !== "function") section.canShow = () => true
    section.fields?.forEach?.(fieldProcessing)
  })
}