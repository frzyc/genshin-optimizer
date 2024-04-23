import { useEffect } from 'react'

export function AdSenseUnit({
  dataAdSlot,
  height,
  width,
}: {
  dataAdSlot: string
  height?: number
  width?: number
}) {
  useEffect(() => {
    try {
      const w = window as any
      w.adsbygoogle = (window as any).adsbygoogle || []
      w.adsbygoogle.push({})
    } catch (e) {
      console.error(e)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', height: `${height}px`, width: `${width}px` }}
      data-ad-client="ca-pub-2443965532085844"
      data-ad-slot={dataAdSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  )
}
