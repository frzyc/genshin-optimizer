import { tooltipJSONData } from '@genshin-optimizer/zzz/dm'

export function processText(text: string) {
  const processedText = text
    .replaceAll('<color=', '<ct color=')
    .replaceAll('</color>', '</ct>')
    // Process IconMap input buttons like <IconMap:Icon_Normal> to be <IconNormal />
    .replace(
      /<IconMap:([a-zA-Z_]*?)>/g,
      (_match, capture: string) => `<${capture.replaceAll('_', '')} />`
    )
    .replaceAll(
      /<Term:(.*?)>/g,
      (_match, capture: string) =>
        `<tooltip ns=tooltips_gen baseKey18=${capture}>${tooltipJSONData[capture]?.name || capture}</tooltip>`
    )

  // Convert \n to real breaks
  if (processedText.includes('\n'))
    return Object.fromEntries(
      processedText.split('\n').map((str, index) => [index, str])
    )

  return processedText
}
