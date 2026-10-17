/** Case-insensitive palette search; avoids mobile auto-capitalization on inputs. */
export function normalizeCommandSearch(query: string): string {
  return query.trim().toLocaleLowerCase()
}

/** Strip spaces/punctuation so `1hitdmg` matches `1-Hit DMG`, `er` matches `Energy Recharge`. */
export function compactSearchKey(text: string): string {
  return text.toLocaleLowerCase().replace(/[^a-z0-9]/g, '')
}

/** First letter of each word — `ks` matches `Kuki Shinobu`. */
export function wordInitialsKey(text: string): string {
  return text
    .split(/[\s\-]+/)
    .filter((w) => w.length > 0)
    .map((word) => {
      const ch = word.match(/[a-z0-9]/i)?.[0]
      return ch ? ch.toLowerCase() : ''
    })
    .join('')
}

/** `KukiShinobu` → `Kuki Shinobu` for search tokens. */
export function splitCamelCaseForSearch(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function matchesCommandSearch(haystack: string, query: string): boolean {
  const q = normalizeCommandSearch(query)
  if (!q) return true
  const lower = haystack.toLocaleLowerCase()
  if (lower.includes(q)) return true
  const compactHay = compactSearchKey(haystack)
  const compactQ = compactSearchKey(q)
  if (!compactQ) return true
  if (compactHay.includes(compactQ)) return true
  const initials = wordInitialsKey(haystack)
  return initials.includes(compactQ)
}

/** Per-field match — avoids compact matches spanning joined tokens (e.g. Cyno + electro → "noel"). */
export function matchesCommandSearchAny(
  fields: string[],
  query: string
): boolean {
  return fields.some((field) => matchesCommandSearch(field, query))
}

export const commandSearchInputProps = {
  autoCapitalize: 'off',
  autoCorrect: 'off',
  spellCheck: 'false',
} as const
