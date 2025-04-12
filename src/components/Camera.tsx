"use client"

import { useEffect, useRef, useState } from "react"
import { CameraIcon, CameraOff, Loader2, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface CameraProps {
  onPhotoCapture: (photoData: string) => void
}

const Camera = ({ onPhotoCapture }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [flashActive, setFlashActive] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(4)
  const isMobile = useIsMobile()

  // Fixed resolution to exactly 1280x720 (720p)
  const cameraWidth = 1280
  const cameraHeight = 720

  const startCamera = async () => {
    setIsLoading(true)
    setPermissionError(null)

    try {
      // Set exact resolution to 1280x720
      const constraints = {
        video: {
          facingMode: "user",
          width: { exact: cameraWidth },
          height: { exact: cameraHeight },
          frameRate: { ideal: 30 },
        },
        audio: false,
      }

      console.log("Camera constraints:", constraints)
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Log the actual track settings to debug resolution issues
        const videoTrack = mediaStream.getVideoTracks()[0]
        console.log("Camera track settings:", videoTrack.getSettings())

        setStream(mediaStream)
        setHasPermission(true)
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      setHasPermission(false)

      // More detailed error handling
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionError("Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.")
      } else if (error.name === "NotFoundError") {
        setPermissionError("Tidak ada kamera yang tersedia pada perangkat ini.")
      } else if (error.name === "NotReadableError" || error.name === "AbortError") {
        setPermissionError("Kamera sedang digunakan aplikasi lain. Silakan tutup aplikasi tersebut dan coba lagi.")
      } else if (error.name === "OverconstrainedError") {
        setPermissionError(
          "Resolusi kamera 1280x720 tidak didukung oleh perangkat ini. Mencoba dengan resolusi yang tersedia.",
        )
        // Try again with ideal constraints instead of exact
        retryWithIdealResolution()
      } else {
        setPermissionError(`Terjadi masalah saat mengakses kamera: ${error.message || "Error tidak diketahui"}`)
      }

      toast.error("Tidak bisa mengakses kamera. Cek konsol untuk detail.")
    } finally {
      setIsLoading(false)
    }
  }

  const retryWithIdealResolution = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: cameraWidth },
          height: { ideal: cameraHeight },
          frameRate: { ideal: 30 },
        },
        audio: false,
      }

      console.log("Retrying with ideal camera constraints:", constraints)
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        const videoTrack = mediaStream.getVideoTracks()[0]
        console.log("Camera track settings (fallback):", videoTrack.getSettings())

        setStream(mediaStream)
        setHasPermission(true)
        setPermissionError(null)
      }
    } catch (error) {
      console.error("Error accessing camera with fallback resolution:", error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const retryCamera = () => {
    stopCamera()
    setHasPermission(null)
    setPermissionError(null)
    setTimeout(startCamera, 500) // Add slight delay before retry
  }

  const startCountdown = () => {
    if (!stream || isLoading || isCountingDown) return

    setIsCountingDown(true)
    setCountdown(4)

    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval)
          capturePhoto()
          setIsCountingDown(false)
          return 0
        }
        return prevCount - 1
      })
    }, 1000)
  }

  // Add a function to verify the photo dimensions
  const verifyPhotoDimensions = (dataUrl: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image()
      img.onload = () => {
        console.log("Loaded photo dimensions:", img.width, "x", img.height)

        // If dimensions don't match, resize on a temporary canvas
        if (img.width !== cameraWidth || img.height !== cameraHeight) {
          console.log("Resizing photo to match exact dimensions")
          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = cameraWidth
          tempCanvas.height = cameraHeight
          const ctx = tempCanvas.getContext("2d")

          if (ctx) {
            ctx.drawImage(img, 0, 0, cameraWidth, cameraHeight)
            const resizedDataUrl = tempCanvas.toDataURL("image/jpeg", 0.95)
            resolve(resizedDataUrl)
          } else {
            resolve(dataUrl) // Fallback to original if context creation fails
          }
        } else {
          resolve(dataUrl) // Already correct dimensions
        }
      }
      img.crossOrigin = "anonymous"
      img.src = dataUrl
    })
  }

  // Update capturePhoto function to use the verification
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Always set canvas to exactly 1280x720 regardless of video dimensions
        canvas.width = cameraWidth
        canvas.height = cameraHeight

        console.log("Canvas dimensions set to:", canvas.width, "x", canvas.height)

        // Flash effect
        setFlashActive(true)
        setTimeout(() => setFlashActive(false), 500)

        // Get the video dimensions
        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight
        console.log("Actual video dimensions:", videoWidth, "x", videoHeight)

        // Calculate scaling and positioning to maintain aspect ratio
        let sx = 0,
          sy = 0,
          sWidth = videoWidth,
          sHeight = videoHeight

        // If video aspect ratio doesn't match 16:9, crop it to fit
        const targetAspectRatio = cameraWidth / cameraHeight
        const videoAspectRatio = videoWidth / videoHeight

        if (videoAspectRatio > targetAspectRatio) {
          // Video is wider than target, crop the sides
          sWidth = videoHeight * targetAspectRatio
          sx = (videoWidth - sWidth) / 2
        } else if (videoAspectRatio < targetAspectRatio) {
          // Video is taller than target, crop top/bottom
          sHeight = videoWidth / targetAspectRatio
          sy = (videoHeight - sHeight) / 2
        }

        // Draw the video frame to canvas, cropping if necessary to maintain aspect ratio
        context.drawImage(
          video,
          sx,
          sy,
          sWidth,
          sHeight, // Source rectangle (cropping)
          0,
          0,
          cameraWidth,
          cameraHeight, // Destination rectangle (1280x720)
        )

        // Convert canvas to high quality JPEG
        const photoData = canvas.toDataURL("image/jpeg", 0.95)

        // Verify and ensure the photo has exactly 1280x720 dimensions
        verifyPhotoDimensions(photoData).then((finalPhotoData) => {
          console.log("Final photo captured with dimensions:", cameraWidth, "x", cameraHeight)
          onPhotoCapture(finalPhotoData)
        })
      }
    }
  }

  useEffect(() => {
    // Start camera when component mounts
    startCamera()

    // Clean up when component unmounts
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden bg-black">
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-center p-4">
            <div>
              <CameraOff size={48} className="mx-auto mb-4 text-red-500" />
              <p>{permissionError || "Akses kamera ditolak"}</p>
              <p className="text-sm mt-2 text-gray-400">Mohon berikan izin kamera di pengaturan browser Anda</p>
              <Button onClick={retryCamera} variant="secondary" className="mt-4" size="sm">
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
            <Loader2 className="animate-spin mr-2" />
            <span>Memulai kamera...</span>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            aspectRatio: `${cameraWidth}/${cameraHeight}`,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />

        {isCountingDown && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 text-white rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-4xl font-bold">{countdown}</span>
            </div>
          </div>
        )}

        {flashActive && <div className="absolute inset-0 bg-white animate-photo-flash" />}
      </div>

      <canvas ref={canvasRef} className="hidden" width={cameraWidth} height={cameraHeight} />

      {hasPermission === true && (
        <div className="mt-2 flex justify-center">
          <Button
            onClick={startCountdown}
            disabled={!stream || isLoading || isCountingDown}
            variant="secondary"
            className="rounded-full h-14 w-14 p-0 bg-white border-2 border-photobooth-pink hover:bg-photobooth-pink/20"
          >
            {isCountingDown ? <Timer size={24} /> : <CameraIcon size={24} />}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Camera
