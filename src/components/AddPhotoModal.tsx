
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload } from "lucide-react";
import { useDailyReports } from "@/hooks/useDailyReports";

interface AddPhotoModalProps {
  reportId: string;
  reportTitle: string;
  open: boolean;
  onClose: () => void;
}

export function AddPhotoModal({ reportId, reportTitle, open, onClose }: AddPhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const { addPhoto, isAddingPhoto } = useDailyReports();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    addPhoto(
      {
        reportId,
        file: selectedFile,
        caption: caption.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCaption('');
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Foto</DialogTitle>
          <p className="text-sm text-muted-foreground">{reportTitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="photo">
              <Camera className="w-4 h-4 inline mr-1" />
              Selecionar Foto *
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1"
              required
            />
          </div>

          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded border"
              />
            </div>
          )}

          <div>
            <Label htmlFor="caption">Legenda (Opcional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Descreva a foto..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!selectedFile || isAddingPhoto}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isAddingPhoto ? 'Enviando...' : 'Adicionar Foto'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
