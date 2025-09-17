
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useActivityInteractions } from "@/hooks/useActivityInteractions";
import { validateFileUpload } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
}

export function PhotoUploadModal({ open, onClose, activityId, activityTitle }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPhoto, uploading } = useActivityInteractions();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file security
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        toast({
          title: "Arquivo inválido",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }

      // Additional check for images only in photo upload
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas imagens são permitidas neste upload.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadPhoto(activityId, selectedFile, caption);
    if (result) {
      handleClose();
    }
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
          <p className="text-sm text-muted-foreground">{activityTitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="photo-upload">Selecionar Foto</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="caption">Legenda (opcional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Adicione uma descrição para a foto..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Enviar Foto'}
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
