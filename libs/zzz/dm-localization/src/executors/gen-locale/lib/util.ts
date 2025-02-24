export function processText(text: string) {
  return text
    .replaceAll('<color=', '<ct color=')
    .replaceAll('</color>', '</ct>')
}
