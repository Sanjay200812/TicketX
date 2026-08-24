"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Crop, Check, RotateCw, Move, RefreshCw, ZoomIn } from 'lucide-react';
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc(null);
    }
  }, [imageFile]);

  // Reset Adjust & Zoom (Requirement 20)
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Mouse & Touch Drag Handlers for Adjust Mode (Requirement 20)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || !imageSrc) return null;

  const handleApplyCrop = () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 512 x 512 square profile output
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imgRef.current;
    const previewContainerSize = 256; // size of visual preview box

    // Calculate ratio of output canvas to visual container
    const previewToOutputRatio = outputSize / previewContainerSize;

    ctx.save();
    // Move origin to canvas center
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Apply drag pan offset scaled to output canvas dimensions
    const drawOffsetX = offset.x * previewToOutputRatio;
    const drawOffsetY = offset.y * previewToOutputRatio;

    // Calculate base draw dimensions
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = outputSize;
    let drawHeight = outputSize;

    if (aspect > 1) {
      drawWidth = outputSize * aspect;
      drawHeight = outputSize;
    } else {
      drawWidth = outputSize;
      drawHeight = outputSize / aspect;
    }

    ctx.drawImage(
      img,
      -drawWidth / 2 + drawOffsetX / zoom,
      -drawHeight / 2 + drawOffsetY / zoom,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      setIsProcessing(false);
      if (blob) {
        const croppedFile = new File([blob], `avatar-${Date.now()}.webp`, { type: 'image/webp' });
        onCropComplete(croppedFile);
        onClose();
      }
    }, 'image/webp', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141418] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
            <Crop className="w-5 h-5 text-primary" /> Adjust Profile Picture
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular Crop Preview Container with Drag Support (Requirement 20) */}
        <div className="space-y-1 text-center">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-primary/70 shadow-2xl bg-black cursor-grab active:cursor-grabbing flex items-center justify-center select-none group"
            title="Click and drag to reposition image"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Preview"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                maxWidth: 'none',
              }}
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Adjust Helper Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-sm">
                <Move className="w-3 h-3 text-primary" /> Drag to adjust
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            Drag image to reposition • Circular crop preview
          </p>
        </div>

        {/* Zoom & Rotate Controls */}
        <div className="space-y-4 px-2">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300 mb-1.5">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-primary" /> Zoom
              </span>
              <span className="font-mono text-primary font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-bold">-</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
              <span className="text-xs text-muted-foreground font-bold">+</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Modal Actions */}
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
            <Check className="w-4 h-4" /> {isProcessing ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
