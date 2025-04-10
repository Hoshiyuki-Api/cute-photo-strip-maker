
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
    const PHOTO_HEIGHT = 380; // Slightly smaller to allow for spacing
    const SPACING = 15; // Spacing between photos
    const STRIP_HEIGHT = (PHOTO_HEIGHT + SPACING) * 4 + 100; // Extra space for footer
    const MARGIN = 20;
    
    // Set canvas dimensions
    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;
    
    // Fill background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
    
    // Add decorative border around entire strip
    ctx.strokeStyle = "#FF9AD5"; // Pink border
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, STRIP_WIDTH - 20, STRIP_HEIGHT - 20);
    
    // Add some decorative elements to the corners
    const cornerSize = 40;
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 10);
    ctx.lineTo(30, 10);
    ctx.strokeStyle = "#FFD700"; // Gold
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
          // Add spacing between photos
          const y = i * (PHOTO_HEIGHT + SPACING) + MARGIN;
          
          // Draw the photo
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Draw border around photo for better separation
          ctx.strokeStyle = "#f0f0f0";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, drawWidth, drawHeight);
        }
      } catch (error) {
        console.error("Error loading photo:", error);
      }
    }
    
    // Draw all stickers AFTER photos so they can be placed around the edges
    // Collect all stickers from different photos
    const allStickers: StickerType[] = [
      ...selectedStickers.photo1,
      ...selectedStickers.photo2,
      ...selectedStickers.photo3,
      ...selectedStickers.photo4
    ];
    
    // Calculate positions for stickers along the edges of the strip
    const positions = [
      // Left edge
      { x: 20, y: 120 },
      { x: 25, y: 250 },
      { x: 15, y: 400 },
      { x: 30, y: 550 },
      { x: 20, y: 700 },
      { x: 25, y: 850 },
      
      // Right edge
      { x: STRIP_WIDTH - 100, y: 150 },
      { x: STRIP_WIDTH - 90, y: 300 },
      { x: STRIP_WIDTH - 110, y: 450 },
      { x: STRIP_WIDTH - 95, y: 600 },
      { x: STRIP_WIDTH - 100, y: 750 },
      { x: STRIP_WIDTH - 90, y: 900 },
      
      // Top edge
      { x: 150, y: 25 },
      { x: 300, y: 30 },
      { x: 450, y: 20 },
      
      // Bottom edge
      { x: 200, y: STRIP_HEIGHT - 90 },
      { x: 350, y: STRIP_HEIGHT - 85 },
      { x: 450, y: STRIP_HEIGHT - 95 }
    ];
    
    // Draw stickers around the edges
    for (let i = 0; i < allStickers.length; i++) {
      try {
        const sticker = allStickers[i];
        const stickerImg = await loadImage(sticker.src);
        
        // Get position from array, or generate random if no more predefined positions
        const position = i < positions.length ? 
          positions[i] : 
          { 
            x: Math.random() * (STRIP_WIDTH - 100) + 50,
            y: Math.random() * (STRIP_HEIGHT - 100) + 50
          };
        
        // Draw sticker at position with some random rotation for fun
        const stickerSize = Math.random() * 30 + 60; // Size between 60 and 90
        const rotation = Math.random() * 0.5 - 0.25; // Small rotation between -0.25 and 0.25 radians
        
        ctx.save();
        ctx.translate(position.x + stickerSize/2, position.y + stickerSize/2);
        ctx.rotate(rotation);
        ctx.drawImage(stickerImg, -stickerSize/2, -stickerSize/2, stickerSize, stickerSize);
        ctx.restore();
      } catch (error) {
        console.error("Error loading sticker:", error);
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
