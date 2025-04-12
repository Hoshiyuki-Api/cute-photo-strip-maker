
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
    
    const STRIP_WIDTH = 600;
    const PHOTO_HEIGHT = 380; // Slightly smaller to allow for spacing
    const SPACING = 20; // Increased spacing between photos
    const STRIP_HEIGHT = (PHOTO_HEIGHT + SPACING) * 4 + 100; // Extra space for footer
    const MARGIN = 20;
    
    // Set canvas dimensions
    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;
    
    // Fill background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
    
    // Add decorative border around entire strip based on selected frame
    // Handle both hex colors and gradients
    if (selectedFrame.borderColor.startsWith('linear')) {
      // Create gradient
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
    
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, STRIP_WIDTH - 20, STRIP_HEIGHT - 20);
    
    // Add some decorative elements to the corners based on selected frame
    const cornerSize = 40;
    ctx.strokeStyle = selectedFrame.cornerStyle;
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 10);
    ctx.lineTo(30, 10);
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Top right corner
    ctx.beginPath();
    ctx.moveTo(STRIP_WIDTH - 30, 10);
    ctx.lineTo(STRIP_WIDTH - 10, 10);
    ctx.lineTo(STRIP_WIDTH - 10, 30);
    ctx.stroke();
    
    // Bottom left corner
    ctx.beginPath();
    ctx.moveTo(10, STRIP_HEIGHT - 30);
    ctx.lineTo(10, STRIP_HEIGHT - 10);
    ctx.lineTo(30, STRIP_HEIGHT - 10);
    ctx.stroke();
    
    // Bottom right corner
    ctx.beginPath();
    ctx.moveTo(STRIP_WIDTH - 30, STRIP_HEIGHT - 10);
    ctx.lineTo(STRIP_WIDTH - 10, STRIP_HEIGHT - 10);
    ctx.lineTo(STRIP_WIDTH - 10, STRIP_HEIGHT - 30);
    ctx.stroke();
    
    // Preload all images before drawing
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Draw photos with more spacing
    for (let i = 0; i < Math.min(photos.length, 4); i++) {
      try {
        if (photos[i]) {
          const img = await loadImage(photos[i]);
          
          // Calculate aspect ratio to fit the width of the strip
          const aspectRatio = img.width / img.height;
          const drawHeight = PHOTO_HEIGHT;
          const drawWidth = drawHeight * aspectRatio;
          
          // Center the image horizontally
          const x = (STRIP_WIDTH - drawWidth) / 2;
          // Add more spacing between photos
          const y = i * (PHOTO_HEIGHT + SPACING) + MARGIN;
          
          // Draw the photo
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Draw border around photo for better separation
          ctx.strokeStyle = "#f0f0f0";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, drawWidth, drawHeight);
          
          // Add small decorative elements on photo corners matching the frame style
          const cornerDecorSize = 15;
          ctx.strokeStyle = selectedFrame.cornerStyle;
          ctx.lineWidth = 3;
          
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
    
    // Add footer with date
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    
    ctx.fillStyle = "black";
    ctx.font = "bold 24px 'Bubblegum Sans', cursive";
    ctx.textAlign = "center";
    ctx.fillText("YukiPhotobooth", STRIP_WIDTH / 2, STRIP_HEIGHT - 50);
    
    ctx.font = "16px 'Poppins', sans-serif";
    ctx.fillText(formattedDate, STRIP_WIDTH / 2, STRIP_HEIGHT - 25);
    
    // Add copyright
    ctx.font = "12px 'Poppins', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("© 2025 AmmarBN", STRIP_WIDTH - 20, STRIP_HEIGHT - 10);
  };
  
  const downloadPhotoStrip = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `photobooth-${new Date().getTime()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.8);
    link.click();
    toast.success("Foto berhasil diunduh!");
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="photo-strip rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto" />
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
