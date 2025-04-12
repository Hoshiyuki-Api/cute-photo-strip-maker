import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { FrameType } from "./FrameSelector";

interface PhotoStripProps {
  photos: string[];
  selectedFrame: FrameType;
  showDownload?: boolean;
}

const PhotoStrip = ({ photos, selectedFrame, showDownload = true }: PhotoStripProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    renderPhotoStrip();
  }, [photos, selectedFrame]);
  
  const renderPhotoStrip = async () => {
    const canvas = canvasRef.current;
    if (!canvas || photos.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set high-resolution dimensions for 9:16 aspect ratio
    const STRIP_WIDTH = 1080; // Doubled resolution
    const STRIP_HEIGHT = 1920; // Doubled resolution, 9:16 ratio
    const PHOTO_HEIGHT = 400; // Increased photo height
    const SPACING = 30; // Increased spacing
    const MARGIN = 50; // Increased margin
    
    // Set canvas dimensions and scale
    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;
    
    // High-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Fill background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
    
    // Add decorative border with gradient or color
    if (selectedFrame.borderColor.startsWith('linear')) {
      const gradient = ctx.createLinearGradient(0, 0, STRIP_WIDTH, 0);
      const colors = selectedFrame.borderColor
        .replace('linear-gradient(90deg, ', '')
        .replace(')', '')
        .split(', ');
      
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
      
      ctx.strokeStyle = gradient;
    } else {
      ctx.strokeStyle = selectedFrame.borderColor; 
    }
    
    ctx.lineWidth = 16; // Increased border width
    ctx.strokeRect(20, 20, STRIP_WIDTH - 40, STRIP_HEIGHT - 40);
    
    // Corner decorations
    ctx.strokeStyle = selectedFrame.cornerStyle;
    ctx.lineWidth = 12;
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(20, 60);
    ctx.lineTo(20, 20);
    ctx.lineTo(60, 20);
    ctx.stroke();
    
    // Top right corner
    ctx.beginPath();
    ctx.moveTo(STRIP_WIDTH - 60, 20);
    ctx.lineTo(STRIP_WIDTH - 20, 20);
    ctx.lineTo(STRIP_WIDTH - 20, 60);
    ctx.stroke();
    
    // Bottom left corner
    ctx.beginPath();
    ctx.moveTo(20, STRIP_HEIGHT - 60);
    ctx.lineTo(20, STRIP_HEIGHT - 20);
    ctx.lineTo(60, STRIP_HEIGHT - 20);
    ctx.stroke();
    
    // Bottom right corner
    ctx.beginPath();
    ctx.moveTo(STRIP_WIDTH - 60, STRIP_HEIGHT - 20);
    ctx.lineTo(STRIP_WIDTH - 20, STRIP_HEIGHT - 20);
    ctx.lineTo(STRIP_WIDTH - 20, STRIP_HEIGHT - 60);
    ctx.stroke();
    
    // Preload images with high-quality image loading
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = 'anonymous'; // Enable CORS for better image loading
        img.src = src;
      });
    };

    // Center photos vertically with more precise calculation
    const totalPhotosHeight = (PHOTO_HEIGHT * photos.length) + (SPACING * (photos.length - 1));
    const startY = (STRIP_HEIGHT - totalPhotosHeight) / 2;
    
    // Draw photos with enhanced quality
    for (let i = 0; i < Math.min(photos.length, 4); i++) {
      try {
        if (photos[i]) {
          const img = await loadImage(photos[i]);
          
          // Maintain aspect ratio with higher quality
          const aspectRatio = img.width / img.height;
          const drawHeight = PHOTO_HEIGHT;
          const drawWidth = drawHeight * aspectRatio;
          
          const x = (STRIP_WIDTH - drawWidth) / 2;
          const y = startY + (i * (PHOTO_HEIGHT + SPACING));
          
          // High-quality image drawing
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Refined photo border
          ctx.strokeStyle = "#e0e0e0";
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, drawWidth, drawHeight);
          
          // Photo corner decorations
          const cornerDecorSize = 30;
          ctx.strokeStyle = selectedFrame.cornerStyle;
          ctx.lineWidth = 6;
          
          // Top left
          ctx.beginPath();
          ctx.moveTo(x, y + cornerDecorSize);
          ctx.lineTo(x, y);
          ctx.lineTo(x + cornerDecorSize, y);
          ctx.stroke();
          
          // Top right
          ctx.beginPath();
          ctx.moveTo(x + drawWidth - cornerDecorSize, y);
          ctx.lineTo(x + drawWidth, y);
          ctx.lineTo(x + drawWidth, y + cornerDecorSize);
          ctx.stroke();
          
          // Bottom left
          ctx.beginPath();
          ctx.moveTo(x, y + drawHeight - cornerDecorSize);
          ctx.lineTo(x, y + drawHeight);
          ctx.lineTo(x + cornerDecorSize, y + drawHeight);
          ctx.stroke();
          
          // Bottom right
          ctx.beginPath();
          ctx.moveTo(x + drawWidth - cornerDecorSize, y + drawHeight);
          ctx.lineTo(x + drawWidth, y + drawHeight);
          ctx.lineTo(x + drawWidth, y + drawHeight - cornerDecorSize);
          ctx.stroke();
        }
      } catch (error) {
        console.error("Error loading photo:", error);
      }
    }
    
    // Enhanced title and text
    ctx.fillStyle = "black";
    ctx.font = "bold 64px 'Bubblegum Sans', cursive";
    ctx.textAlign = "center";
    ctx.fillText("YukiPhotobooth", STRIP_WIDTH / 2, MARGIN + 60);
    
    // Date and copyright with improved typography
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    
    ctx.font = "32px 'Poppins', sans-serif";
    ctx.fillText(formattedDate, STRIP_WIDTH / 2, STRIP_HEIGHT - 100);
    
    ctx.font = "24px 'Poppins', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("© 2025 AmmarBN", STRIP_WIDTH - 40, STRIP_HEIGHT - 40);
  };
  
  const downloadPhotoStrip = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `photobooth-${new Date().getTime()}.png`; // Change to PNG for better quality
    link.href = canvasRef.current.toDataURL('image/png'); // Use PNG instead of JPEG
    link.click();
    toast.success("Foto berhasil diunduh!");
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="photo-strip rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto max-h-[80vh]" />
      </div>
      
      {showDownload && photos.length > 0 && (
        <Button 
          onClick={downloadPhotoStrip}
          className="mt-4 bg-photobooth-pink hover:bg-photobooth-pink/80 text-primary-foreground"
        >
          <Download className="mr-2 h-4 w-4" /> Unduh
        </Button>
      )}
    </div>
  );
};

export default PhotoStrip;
