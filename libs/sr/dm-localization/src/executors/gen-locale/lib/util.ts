export function convertToHash(str: string) {
  let hash1 = 5381 | 0
  let hash2 = hash1 | 0

  for (let i = 0; i < str.length; i += 2) {
    hash1 = ((hash1 << 5) + hash1) ^ str.charCodeAt(i)
    if (i === str.length - 1 || str[i + 1] === '\0') break
    hash2 = ((hash2 << 5) + hash2) ^ str.charCodeAt(i + 1)
  }

  return (hash1 + Math.imul(hash2, 1566083941)) | 0
}
