import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
}
interface ReportPhotosProps {
  photos: Photo[];
  reportId: string;
}
export function ReportPhotos({
  photos,
  reportId
}: ReportPhotosProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const handleDownloadImage = async (photoUrl: string, fileName?: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `relatorio-${reportId}-foto-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };
  const nextPhoto = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };
  const prevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };
  if (!photos || photos.length === 0) return null;
  return <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium  text-inherit">
          Fotos ({photos.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => handleDownloadImage(photos[selectedPhotoIndex].photo_url, `relatorio-${reportId}-foto-${selectedPhotoIndex + 1}.jpg`)}>
          <Download className="w-4 h-4 mr-2" />
          Baixar
        </Button>
      </div>

      <div className="relative">
        <img src={photos[selectedPhotoIndex].photo_url} alt={photos[selectedPhotoIndex].caption || `Foto ${selectedPhotoIndex + 1}`} className="w-full h-64 md:h-80 rounded border object-cover" />
        
        {photos.length > 1 && <>
            <Button size="sm" variant="outline" className="absolute left-2 top-1/2 transform -translate-y-1/2" onClick={prevPhoto} disabled={selectedPhotoIndex === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={nextPhoto} disabled={selectedPhotoIndex === photos.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>}
      </div>

      {photos[selectedPhotoIndex].caption && <p className="text-sm text-gray-700 mt-2 break-words">
          {photos[selectedPhotoIndex].caption}
        </p>}

      {photos.length > 1 && <>
          <div className="flex justify-center items-center gap-2 mt-4">
            <span className="text-sm text-gray-500">
              {selectedPhotoIndex + 1} de {photos.length}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
            {photos.map((photo, index) => <button key={photo.id} onClick={() => setSelectedPhotoIndex(index)} className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${index === selectedPhotoIndex ? 'border-vale-blue' : 'border-gray-200'}`}>
                <img src={photo.photo_url} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
              </button>)}
          </div>
        </>}
    </div>;
}