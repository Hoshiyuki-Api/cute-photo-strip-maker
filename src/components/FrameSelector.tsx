
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FrameType {
  id: string;
  name: string;
  src: string;
  borderColor: string;
  cornerStyle: string;
}

const frames: FrameType[] = [
  {
    id: "cute-pink",
    name: "Cute Pink",
    src: "",
    borderColor: "#FF9AD5",
    cornerStyle: "#FFD700"
  },
  {
    id: "blue-stars",
    name: "Blue Stars",
    src: "",
    borderColor: "#58C4F6",
    cornerStyle: "#5E17EB"
  },
  {
    id: "rainbow",
    name: "Rainbow",
    src: "",
    borderColor: "linear-gradient(90deg, #FF9AD5, #FFD700, #58C4F6, #9F58F6)",
    cornerStyle: "#FF9AD5"
  },
  {
    id: "golden",
    name: "Golden",
    src: "",
    borderColor: "#FFD700",
    cornerStyle: "#FF9AD5"
  },
  {
    id: "hearts",
    name: "Hearts",
    src: "",
    borderColor: "#FF6B6B",
    cornerStyle: "#FF9AD5"
  },
];

interface FrameSelectorProps {
  selectedFrame: string;
  onSelect: (frame: FrameType) => void;
}

const FrameSelector = ({ selectedFrame, onSelect }: FrameSelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-center">Pilih Bingkai</h3>
          
          <RadioGroup
            value={selectedFrame}
            onValueChange={(value) => {
              const frame = frames.find(f => f.id === value);
              if (frame) onSelect(frame);
            }}
          >
            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
              {frames.map((frame) => (
                <div key={frame.id} className="relative">
                  <RadioGroupItem
                    value={frame.id}
                    id={frame.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={frame.id}
                    className={`flex flex-col items-center gap-2 rounded-md border-2 p-2 hover:bg-accent cursor-pointer ${
                      selectedFrame === frame.id ? "border-photobooth-pink bg-accent/50" : "border-transparent"
                    }`}
                  >
                    <div 
                      className="w-full h-12 rounded-md flex items-center justify-center" 
                      style={{ 
                        background: typeof frame.borderColor === 'string' && frame.borderColor.startsWith('#') ? frame.borderColor : 'transparent',
                        backgroundImage: frame.borderColor.startsWith('linear') ? frame.borderColor : 'none'
                      }}
                    >
                      <div className="w-3/4 h-3/4 bg-white rounded"></div>
                    </div>
                    <span className="text-xs text-center truncate w-full">{frame.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrameSelector;
