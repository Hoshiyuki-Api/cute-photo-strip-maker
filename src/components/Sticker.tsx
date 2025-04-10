
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
        "cursor-pointer transition-all p-2 hover:scale-125 hover:rotate-6 rounded-full bg-white border-2 border-dashed border-photobooth-pink/40 flex items-center justify-center",
        selected && "ring-4 ring-photobooth-pink rounded-full bg-photobooth-pink/20 scale-110 rotate-3",
        className
      )}
      onClick={onClick}
    >
      <img 
        src={sticker.src} 
        alt={sticker.alt} 
        width={sticker.width || 60} 
        height={sticker.height || 60}
        className="object-contain w-full h-full drop-shadow-md"
        style={{
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
        }}
      />
    </div>
  );
};

export default Sticker;
