import { ColorTag, Language, tagColor } from "./const"

export function preprocess(string: string): string {
  { // color tags
    const stack: ColorTag[] = []
    string = string.replace(/<(\/?)color(?:=#([0-9A-F]{8}))?>/g, (_match, isClosed, color) => {
      if (isClosed) return `</${stack.pop()}>`
      const tag = tagColor[color]
      stack.push(tag)
      return `<${tag}>`
    })
  }

  if (string.startsWith("#")) { // `{}` tags
    string = string.substring(1)
      .replace(/\{LAYOUT_(PC|PS|MOBILE)#(.*?)\}/g,
        (_match, layout, text) => layout === "PC" ? text : "") // Use PC layout
  }
  return string
}

export function parseBulletPoints(strings: string[]): string[] {
  strings.push("")
  const { strs } = strings.reduce(({ strs, arr }, str) => {
    const isBullet = str.startsWith("·")
    if (isBullet) str = str.slice(1)
    if (arr) {
      if (isBullet) arr.push(str)
      else {
        strs.push(arr as any) // TODO
        arr = undefined
      }
    } else if (isBullet) { //start of new bullet point list
      arr = [str]
    }
    if (!isBullet) strs.push(str)
    return { strs, arr }
  }, { strs: [] as string[], arr: undefined as string[] | undefined })
  strs.pop()
  return strs
}

//for parsing plunging string
function plungeUtil(lang, string, low) {
  const res = low ? "$2" : "$3"
  string = string.split('|')[0]
  switch (lang) {
    case "chs":
    case "cht":
    case "ja":
      string = string.replace(/((\S{2})\/(\S{2}))/, res)
      break;
    case "th":
      string = string.replace(/((\S{3})\/(\S{3}))/, res)
    default:
      string = string.replace(/((\S+)\/(\S+))/, res)
      break;
  }
  return string
}

export const parsingFunctions: { [key: string]: (lang: Language, string: string) => string } = {
  autoName: (lang, string) => {
    //starts with Normal Attack: ______ in english
    if (string.includes("·")) {
      const index = string.indexOf("·")
      string = string.slice(index + 1)
    } else if (string.includes(":")) {
      string = string.split(":")[1].trim()
    } else if (string.includes(" - ")) {
      const index = string.indexOf(" - ")
      string = string.slice(index + 3)
    }
    if (!string) throw (`${lang} has invalid "name"`)
    return string
  },
  autoFields: (lang, string) => {
    const [normal, charged, plunging] = string.split("\\n\\n").map(s => s.trim().replace(/\\n/g, " "))
    string = { normal, charged, plunging } as any
    return string
  },
  paragraph: (lang, string) => {
    let parsed = string.split("\\n").map(s => s || "<br/>")
    string = { ...parseBulletPoints(parsed) } as any
    return string
  },
  skillParam: (lang, string) => {
    string = string.split('|')[0]
    return string
  },
  plungeLow: (lang, string) => plungeUtil(lang, string, true),
  plungeHigh: (lang, string) => plungeUtil(lang, string, false),
  string: (lang, string) => string
}