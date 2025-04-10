
import { useRef, useEffect } from "react";
import { StickerType } from "./Sticker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface PhotoStripProps {
  photos: string[];
  selectedStickers: {
    photo1: StickerType[];
    photo2: StickerType[];
    photo3: StickerType[];
    photo4: StickerType[];
  };
  showDownload?: boolean;
}

const PhotoStrip = ({ photos, selectedStickers, showDownload = true }: PhotoStripProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    renderPhotoStrip();
  }, [photos, selectedStickers]);
  
  const renderPhotoStrip = async () => {
    const canvas = canvasRef.current;
    if (!canvas || photos.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const STRIP_WIDTH = 600;
    const PHOTO_HEIGHT = 400;
    const STRIP_HEIGHT = PHOTO_HEIGHT * 4 + 100; // Extra space for footer
    const MARGIN = 20;
    
    // Set canvas dimensions
    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;
    
    // Fill background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
    
    // Preload all images before drawing
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Draw photos
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
          const y = i * PHOTO_HEIGHT + MARGIN * (i > 0 ? 1 : 0);
          
          // Draw the photo
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Draw stickers for this photo
          const photoStickers = selectedStickers[`photo${i + 1}` as keyof typeof selectedStickers] || [];
          for (const sticker of photoStickers) {
            try {
              const stickerImg = await loadImage(sticker.src);
              
              // Randomize position slightly within the photo area
              const stickerSize = 80; // Base size
              const stickerX = Math.random() * (drawWidth - stickerSize) + x;
              const stickerY = Math.random() * (drawHeight - stickerSize) + y;
              
              ctx.drawImage(stickerImg, stickerX, stickerY, stickerSize, stickerSize);
            } catch (error) {
              console.error("Error loading sticker:", error);
            }
          }
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
    ctx.fillText("Picapica", STRIP_WIDTH / 2, STRIP_HEIGHT - 50);
    
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
