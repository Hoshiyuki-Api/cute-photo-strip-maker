
import { useState } from "react";
import Camera from "@/components/Camera";
import PhotoStrip from "@/components/PhotoStrip";
import FrameSelector, { FrameType } from "@/components/FrameSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera as CameraIcon, Image, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>({
    id: "cute-pink",
    name: "Cute Pink",
    src: "",
    borderColor: "#FF9AD5",
    cornerStyle: "#FFD700"
  });
  
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
    <div className="min-h-screen bg-gradient-to-b from-photobooth-blue/30 to-photobooth-pink/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-photobooth-pink">Cute</span> Photo Booth
          </h1>
          <p className="text-gray-600">Buat strip foto imut dengan bingkai lucu!</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <Tabs defaultValue="capture" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="capture" disabled={photos.length === 4} className="flex items-center gap-1">
                    <CameraIcon size={16} /> Ambil Foto
                  </TabsTrigger>
                  <TabsTrigger value="preview" disabled={photos.length === 0} className="flex items-center gap-1">
                    <Image size={16} /> Hasil
                  </TabsTrigger>
                </TabsList>
                
                <CardContent className="p-6">
                  <TabsContent value="capture" className="mt-0">
                    <div className="text-center mb-4">
                      <p className="text-sm bg-photobooth-yellow/30 p-2 rounded">
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
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                    <span className="text-sm text-gray-400">
                      {photos.length + index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {photos.length > 0 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="text-sm"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Mulai Ulang
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <div className="sticky top-4">
              {photos.length > 0 && (
                <FrameSelector 
                  selectedFrame={selectedFrame.id} 
                  onSelect={handleFrameSelect} 
                />
              )}
              
              {photos.length === 4 && (
                <Card className="mt-4 bg-photobooth-yellow/20 p-4 text-center">
                  <p className="text-sm mb-3">
                    Semua foto sudah diambil! Pilih bingkai lucu dan unduh hasilnya.
                  </p>
                  <Button 
                    className="bg-photobooth-pink hover:bg-photobooth-pink/80 text-primary-foreground"
                    onClick={() => {
                      const tabElement = document.querySelector('[data-value="preview"]') as HTMLElement;
                      if (tabElement) tabElement.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Lihat & Unduh
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center text-gray-500 text-sm mt-12">
        &copy; 2025 Cute Photo Booth App
      </footer>
    </div>
  );
};

export default Index;
