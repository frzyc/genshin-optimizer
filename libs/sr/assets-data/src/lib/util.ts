export function trimPath(path: string) {
  if (!path) path = ''
  return path.split('/').at(-1) ?? ''
}
