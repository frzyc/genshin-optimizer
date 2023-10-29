import type { StaticImageData } from 'next/image'

export function assetWrapper(src: unknown) {
  if (typeof src === 'string') return { src } as StaticImageData
  else return src as StaticImageData
}
