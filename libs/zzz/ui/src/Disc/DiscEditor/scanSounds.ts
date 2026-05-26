import cameraShutterSound from './camera-shutter-01.mp3'
import scanErrorSound from './scan-error.mp3'

const captureShutterAudio = new Audio(cameraShutterSound)
const scanErrorAudio = new Audio(scanErrorSound)

export function playCaptureShutterSound() {
  captureShutterAudio.currentTime = 0
  void captureShutterAudio.play().catch(() => {})
}

export function playScanErrorSound() {
  scanErrorAudio.currentTime = 0
  void scanErrorAudio.play().catch(() => {})
}
