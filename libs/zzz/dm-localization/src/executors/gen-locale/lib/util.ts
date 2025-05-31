export function processText(text: string) {
  const processedText = text
    .replaceAll('<color=', '<ct color=')
    .replaceAll('</color>', '</ct>')
    // Process IconMap input buttons like <IconMap:Icon_Normal> to be <IconNormal />
    .replace(
      /<IconMap:([a-zA-Z_]*?)>/g,
      (_match, capture: string) => `<${capture.replaceAll('_', '')} />`
    )

  // Convert \n to real breaks
  if (processedText.includes('\n'))
    return Object.fromEntries(
      processedText.split('\n').map((str, index) => [index, str])
    )

  return processedText
}
