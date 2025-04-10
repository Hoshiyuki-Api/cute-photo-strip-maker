
import { cn } from "@/lib/utils";

export type StickerType = {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

interface StickerProps {
  sticker: StickerType;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const Sticker = ({ sticker, className, onClick, selected }: StickerProps) => {
  return (
    <div 
      className={cn(
        "cursor-pointer transition-all p-2 hover:scale-110 bg-white rounded-md flex items-center justify-center",
        selected && "ring-2 ring-photobooth-pink rounded-md bg-photobooth-pink/20",
        className
      )}
      onClick={onClick}
    >
      <img 
        src={sticker.src} 
        alt={sticker.alt} 
        width={sticker.width || 60} 
        height={sticker.height || 60}
        className="object-contain w-full h-full"
      />
    </div>
  );
};

export default Sticker;
