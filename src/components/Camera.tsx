
import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CameraProps {
  onPhotoCapture: (photoData: string) => void;
}

const Camera = ({ onPhotoCapture }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashActive, setFlashActive] = useState(false);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 480 },
          height: { ideal: 640 }
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
      toast.error("Tidak bisa mengakses kamera. Pastikan Anda memberikan izin.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Flash effect
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 500);
        
        // Draw video frame to canvas
        context.drawImage(
          videoRef.current,
          0,
          0,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight
        );
        
        // Convert canvas to data URL and pass to parent
        const photoData = canvasRef.current.toDataURL("image/jpeg");
        onPhotoCapture(photoData);
      }
    }
  };

  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    
    // Clean up when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden bg-black">
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-center p-4">
            <div>
              <CameraOff size={48} className="mx-auto mb-4 text-red-500" />
              <p>Akses kamera ditolak</p>
              <p className="text-sm mt-2 text-gray-400">Mohon berikan izin kamera di pengaturan browser Anda</p>
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
        />
        
        {flashActive && (
          <div className="absolute inset-0 bg-white animate-photo-flash" />
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="mt-2 flex justify-center">
        <Button 
          onClick={capturePhoto}
          disabled={!stream || isLoading}
          variant="secondary"
          className="rounded-full h-14 w-14 p-0 bg-white border-2 border-photobooth-pink hover:bg-photobooth-pink/20"
        >
          <CameraIcon size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Camera;
