
import { useState } from "react";
import Sticker, { StickerType } from "./Sticker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, PawPrint, Cat, Dog, Star } from "lucide-react";

interface StickerSelectorProps {
  onSelect: (sticker: StickerType) => void;
}

// Daftar stiker yang tersedia
const animalStickers: StickerType[] = [
  {
    id: "cat1",
    src: "/lovable-uploads/7aba57c1-da55-4a1e-a0a4-cea30e660df7.png",
    alt: "Cat sticker",
  },
  {
    id: "cat2",
    src: "/stickers/cat1.png",
    alt: "Orange cat",
  },
  {
    id: "cat3",
    src: "/stickers/cat2.png",
    alt: "Gray cat",
  },
  {
    id: "dog1",
    src: "/stickers/dog1.png",
    alt: "Cute dog",
  },
  {
    id: "panda1",
    src: "/stickers/panda.png",
    alt: "Panda",
  },
];

const loveStickers: StickerType[] = [
  {
    id: "heart1",
    src: "/stickers/heart1.png",
    alt: "Pink heart",
  },
  {
    id: "heart2",
    src: "/stickers/heart2.png",
    alt: "Red heart",
  },
  {
    id: "stars1",
    src: "/stickers/stars.png",
    alt: "Stars",
  },
  {
    id: "pawprint1",
    src: "/stickers/pawprint.png",
    alt: "Paw print",
  },
];

const StickerSelector = ({ onSelect }: StickerSelectorProps) => {
  const [selectedTab, setSelectedTab] = useState("animals");
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const handleStickerClick = (sticker: StickerType) => {
    setSelectedStickerId(sticker.id);
    onSelect(sticker);
  };

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm border">
      <h3 className="text-lg font-semibold mb-2 text-center">Pilih Stiker</h3>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="animals" className="flex items-center gap-1">
            <Cat size={16} /> Hewan
          </TabsTrigger>
          <TabsTrigger value="love" className="flex items-center gap-1">
            <Heart size={16} /> Cinta
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="animals">
          <ScrollArea className="h-44">
            <div className="grid grid-cols-3 gap-4">
              {animalStickers.map((sticker) => (
                <Sticker
                  key={sticker.id}
                  sticker={sticker}
                  selected={selectedStickerId === sticker.id}
                  onClick={() => handleStickerClick(sticker)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="love">
          <ScrollArea className="h-44">
            <div className="grid grid-cols-3 gap-4">
              {loveStickers.map((sticker) => (
                <Sticker
                  key={sticker.id}
                  sticker={sticker}
                  selected={selectedStickerId === sticker.id}
                  onClick={() => handleStickerClick(sticker)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        Klik stiker untuk menambahkannya ke foto
      </p>
    </div>
  );
};

export default StickerSelector;
