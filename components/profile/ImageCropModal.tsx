"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Crop, Check, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropModal({ isOpen, onClose, imageFile, onCropComplete }: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc(null);
    }
  }, [imageFile]);

  if (!isOpen || !imageSrc) return null;

  const handleApplyCrop = () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Requirement 19: 512 x 512 square profile output
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imgRef.current;
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const cropX = (img.naturalWidth - minDim) / 2;
    const cropY = (img.naturalHeight - minDim) / 2;

    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    ctx.drawImage(
      img,
      cropX,
      cropY,
      minDim,
      minDim,
      -outputSize / 2,
      -outputSize / 2,
      outputSize,
      outputSize
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      setIsProcessing(false);
      if (blob) {
        const croppedFile = new File([blob], `avatar-${Date.now()}.webp`, { type: 'image/webp' });
        onCropComplete(croppedFile);
        onClose();
      }
    }, 'image/webp', 0.9);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141418] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
            <Crop className="w-5 h-5 text-primary" /> Crop Profile Picture
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Square Preview Container */}
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-primary/60 shadow-2xl bg-black flex items-center justify-center">
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Preview"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 px-2">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Zoom</label>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 font-semibold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
            </button>
            <span className="text-[11px] font-mono text-muted-foreground">Output: 512 × 512 px</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-white/15 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="flex-1 rounded-xl font-bold gap-2"
          >
            <Check className="w-4 h-4" /> {isProcessing ? 'Processing...' : 'Apply & Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
