
import { useState } from "react";
import Camera from "@/components/Camera";
import PhotoStrip from "@/components/PhotoStrip";
import FrameSelector, { FrameType } from "@/components/FrameSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera as CameraIcon, Image, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>({
    id: "cute-pink",
    name: "Cute Pink",
    src: "",
    borderColor: "#FF9AD5",
    cornerStyle: "#FFD700"
  });
  const isMobile = useIsMobile();
  
  const handlePhotoCapture = (photoData: string) => {
    if (photos.length < 4) {
      const newPhotos = [...photos, photoData];
      setPhotos(newPhotos);
      
      toast.success(`Foto ${newPhotos.length} berhasil diambil!`);
      
      if (newPhotos.length === 4) {
        toast.success("Semua foto sudah diambil! Sekarang pilih bingkai yang lucu.");
      }
    }
  };
  
  const handleFrameSelect = (frame: FrameType) => {
    setSelectedFrame(frame);
    toast.success(`Bingkai ${frame.name} dipilih!`);
  };
  
  const handleReset = () => {
    if (window.confirm("Yakin ingin memulai ulang? Semua foto akan dihapus.")) {
      setPhotos([]);
      toast.info("Sesi foto dihapus, siap untuk memulai yang baru!");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-photobooth-blue/30 to-photobooth-pink/30 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            <span className="text-photobooth-pink">Cute</span> Photo Booth
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Buat strip foto imut dengan bingkai lucu!</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <Tabs defaultValue="capture" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="capture" disabled={photos.length === 4} className="flex items-center gap-1">
                    <CameraIcon size={isMobile ? 14 : 16} /> <span className="truncate">Ambil Foto</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" disabled={photos.length === 0} className="flex items-center gap-1">
                    <Image size={isMobile ? 14 : 16} /> <span className="truncate">Hasil</span>
                  </TabsTrigger>
                </TabsList>
                
                <CardContent className="p-3 sm:p-6">
                  <TabsContent value="capture" className="mt-0">
                    <div className="text-center mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm bg-photobooth-yellow/30 p-2 rounded">
                        {photos.length < 4
                          ? `Ambil Foto ${photos.length + 1} dari 4`
                          : "Semua foto sudah diambil!"}
                      </p>
                    </div>
                    <Camera onPhotoCapture={handlePhotoCapture} />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0">
                    <PhotoStrip 
                      photos={photos} 
                      selectedFrame={selectedFrame}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
            
            {photos.length > 0 && (
              <div className="mt-4 sm:mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                {photos.map((photo, index) => (
                  <div 
                    key={index}
                    className="relative cursor-pointer overflow-hidden rounded-lg border-2 border-photobooth-pink"
                  >
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`} 
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-black/50 text-white p-1 text-xs">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-[3/4]"
                  >
                    <span className="text-xs sm:text-sm text-gray-400">
                      {photos.length + index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {photos.length > 0 && (
              <div className="mt-3 sm:mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="text-xs sm:text-sm"
                >
                  <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Mulai Ulang
                </Button>
              </div>
            )}
          </div>
          
          <div>
            {isMobile && photos.length === 4 ? (
              <div className="sticky top-4 space-y-4">
                <FrameSelector 
                  selectedFrame={selectedFrame.id} 
                  onSelect={handleFrameSelect} 
                />
                
                <Card className="bg-photobooth-yellow/20 p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                    Semua foto sudah diambil! Pilih bingkai lucu dan unduh hasilnya.
                  </p>
                  <Button 
                    className="bg-photobooth-pink hover:bg-photobooth-pink/80 text-primary-foreground text-sm py-1 h-auto"
                    onClick={() => {
                      const tabElement = document.querySelector('[data-value="preview"]') as HTMLElement;
                      if (tabElement) tabElement.click();
                    }}
                  >
                    <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Lihat & Unduh
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="sticky top-4 space-y-4">
                {photos.length > 0 && (
                  <FrameSelector 
                    selectedFrame={selectedFrame.id} 
                    onSelect={handleFrameSelect} 
                  />
                )}
                
                {photos.length === 4 && (
                  <Card className="mt-4 bg-photobooth-yellow/20 p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                      Semua foto sudah diambil! Pilih bingkai lucu dan unduh hasilnya.
                    </p>
                    <Button 
                      className="bg-photobooth-pink hover:bg-photobooth-pink/80 text-primary-foreground text-sm py-1 h-auto"
                      onClick={() => {
                        const tabElement = document.querySelector('[data-value="preview"]') as HTMLElement;
                        if (tabElement) tabElement.click();
                      }}
                    >
                      <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Lihat & Unduh
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="text-center text-gray-500 text-xs sm:text-sm mt-8 sm:mt-12">
        &copy; 2025 Cute Photo Booth App
      </footer>
    </div>
  );
};

export default Index;
