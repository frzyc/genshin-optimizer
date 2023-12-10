//use to pretty print timestamps, or anything really.
export function strPadLeft(string: string, pad: string, length: number) {
  return (new Array(length + 1).join(pad) + string).slice(-length)
}

//fuzzy compare strings. longer the distance, the higher the mismatch.
export function hammingDistance(str1: string, str2: string) {
  let dist = 0
  str1 = str1.toLowerCase()
  str2 = str2.toLowerCase()
  for (let i = 0, j = Math.max(str1.length, str2.length); i < j; i++) {
    let match = true
    if (!str1[i] || !str2[i] || str1[i] !== str2[i]) match = false
    if (str1[i - 1] === str2[i] || str1[i + 1] === str2[i]) match = true
    if (!match) dist++
  }
  return dist
}

export function levenshteinDistance(str1: string, str2: string) {
  if (!str1.length) return str2.length
  if (!str2.length) return str1.length
  const arr = []
  for (let i = 0; i <= str2.length; i++) {
    arr[i] = [i]
    for (let j = 1; j <= str1.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (str1[j - 1] === str2[i - 1] ? 0 : 1)
            )
    }
  }
  return arr[str2.length][str1.length]
}
