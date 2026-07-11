/** Capture one frame from a display-media stream (16:9 → right third crop). */
export function captureFrameFromStream(
  stream: MediaStream,
  isGenerationActive: () => boolean
): Promise<File | null> {
  const track = stream.getVideoTracks()[0]
  if (!track || track.readyState === 'ended') return Promise.resolve(null)

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    video.playsInline = true

    const finish = (file: File | null) => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.srcObject = null
      resolve(file)
    }

    const onLoadedMetadata = () => {
      if (!isGenerationActive() || track.readyState === 'ended') {
        finish(null)
        return
      }

      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) {
        finish(null)
        return
      }

      const originalWidth = video.videoWidth
      const originalHeight = video.videoHeight
      if (originalWidth < 1 || originalHeight < 1) {
        finish(null)
        return
      }

      const aspectRatio = originalWidth / originalHeight
      const targetRatio = 16 / 9
      const ratioTolerance = 0.1
      const isNear16to9 =
        Math.abs(aspectRatio - targetRatio) <= targetRatio * ratioTolerance

      let canvasWidth = originalWidth
      let canvasHeight = originalHeight
      let sourceX = 0
      const sourceY = 0
      let sourceWidth = originalWidth
      const sourceHeight = originalHeight

      if (isNear16to9) {
        sourceX = Math.floor((originalWidth * 2) / 3)
        sourceWidth = Math.floor(originalWidth / 3)
        canvasWidth = sourceWidth
        canvasHeight = originalHeight
      }

      const canvas = ctx.canvas
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
      )

      canvas.toBlob((blob) => {
        if (!blob || !isGenerationActive() || track.readyState === 'ended') {
          finish(null)
          return
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        finish(
          new File([blob], `screen-capture-${timestamp}.png`, {
            type: 'image/png',
          })
        )
      }, 'image/png')
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.play().catch(() => finish(null))
  })
}
