import { styled } from "@mui/material";

const TextArea = styled("textarea")({
  width: "100%",
  fontFamily: "monospace",
  resize: "vertical",
  minHeight: "5em"
})
export default function ReadOnlyTextArea({ value }: { value: string | number | string[] }) {
  return <TextArea readOnly value={value} onClick={e => {
    const target = e.target as HTMLTextAreaElement;
    target.selectionStart = 0;
    target.selectionEnd = target.value.length;
  }} />
}
