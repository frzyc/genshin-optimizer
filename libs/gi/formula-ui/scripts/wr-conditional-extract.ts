import {
  extractBraceContent,
  readWrSheetSource,
  TALENT_SECTIONS,
  type TalentSection,
} from './wr-text-extract'

export type WrCondPlacement = {
  condName: string
  section: TalentSection
  teamBuff: boolean
}

function buildPathToCondName(wrSrc: string): Map<string, string> {
  const pathToName = new Map<string, string>()
  const condDeclRe =
    /const \[(\w+),\s*(\w+)\]\s*=\s*cond\(\s*[\s\S]*?'([^']+)'\s*\)/g
  let m: RegExpExecArray | null
  while ((m = condDeclRe.exec(wrSrc))) {
    pathToName.set(m[1], m[3])
    pathToName.set(m[2], m[3])
  }
  return pathToName
}

/** WR `condTem` target sections + teamBuff, in sheet order. */
export function extractWrCondLayout(key: string): WrCondPlacement[] {
  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return []

  const pathToName = buildPathToCondName(wrSrc)
  const placements: WrCondPlacement[] = []
  const condTemRe = /ct\.condTem\('([^']+)',\s*\{/g
  let m: RegExpExecArray | null

  while ((m = condTemRe.exec(wrSrc))) {
    const section = m[1] as TalentSection
    if (!TALENT_SECTIONS.includes(section)) continue

    const openBrace = m.index + m[0].length - 1
    const obj = extractBraceContent(wrSrc, openBrace)
    const pathMatch = obj.match(/path:\s*(\w+)/)
    const valueMatch = obj.match(/value:\s*(\w+)/)
    const condName =
      (pathMatch && pathToName.get(pathMatch[1])) ??
      (valueMatch && pathToName.get(valueMatch[1]))
    if (!condName) continue

    placements.push({
      condName,
      section,
      teamBuff: /\bteamBuff:\s*true\b/.test(obj),
    })
  }

  return placements
}
