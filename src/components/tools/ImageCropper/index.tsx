'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, X, Image as ImageIcon, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cn } from '@/lib/utils';

export function ImageCropper() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | 'free'>('free');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [customWidth, setCustomWidth] = useState(300);
  const [customHeight, setCustomHeight] = useState(300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP, GIF)');
      return;
    }

    setImageFile(uploadedFile);
    setError(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const rotateImage = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const toggleFlipH = () => setFlipH((prev) => !prev);
  const toggleFlipV = () => setFlipV((prev) => !prev);

  const applyCustomDimensions = () => {
    if (!imgRef.current) return;
    
    const img = imgRef.current;
    const aspect = customWidth / customHeight;
    setAspectRatio(aspect);
    
    // Set initial crop with custom aspect ratio
    const imageAspect = img.naturalWidth / img.naturalHeight;
    let cropWidth, cropHeight;

    if (aspect > imageAspect) {
      cropWidth = img.naturalWidth;
      cropHeight = cropWidth / aspect;
    } else {
      cropHeight = img.naturalHeight;
      cropWidth = cropHeight * aspect;
    }

    setCrop({
      unit: 'px',
      x: (img.naturalWidth - cropWidth) / 2,
      y: (img.naturalHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  };

  const getCroppedImage = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        // Apply transformations
        ctx.save();
        
        // Handle rotation
        if (rotation !== 0) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // Handle flip
        if (flipH) {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }
        if (flipV) {
          ctx.scale(1, -1);
          ctx.translate(0, -canvas.height);
        }

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        ctx.restore();

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      });
    },
    [rotation, flipH, flipV]
  );

  const downloadImage = async (format: 'jpg' | 'png') => {
    if (!imgRef.current || !completedCrop) {
      setError('Please select a crop area first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await getCroppedImage(imgRef.current, completedCrop);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'jpg' ? 'jpg' : 'png';
      a.download = `cropped-image.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setImageUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspectRatio('free');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <div className="space-y-4">
          <input
            type="file"
            id="image-upload"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <Upload size={48} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, GIF supported
              </p>
            </label>
          </div>

          {imageFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ImageIcon size={16} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{imageFile.name}</span>
              </div>
              <button
                onClick={resetAll}
                className="p-1 hover:bg-background rounded transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Crop Interface */}
      {imageUrl && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          {/* Aspect Ratio Controls */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAspectRatio('free')}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  aspectRatio === 'free'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                Free
              </button>
              <button
                onClick={() => setAspectRatio(1)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  aspectRatio === 1
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                1:1
              </button>
              <button
                onClick={() => setAspectRatio(16 / 9)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  aspectRatio === 16 / 9
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                16:9
              </button>
              <button
                onClick={() => setAspectRatio(4 / 3)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  aspectRatio === 4 / 3
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                4:3
              </button>
              <button
                onClick={() => setAspectRatio(3 / 2)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  aspectRatio === 3 / 2
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                3:2
              </button>
            </div>
          </div>

          {/* Crop Area */}
          <div className="flex justify-center bg-muted/50 rounded-lg p-4 overflow-hidden min-h-[500px]">
            <div className="relative inline-block max-w-full">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio === 'free' ? undefined : aspectRatio}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  className="max-w-full max-h-[500px] object-contain block"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                  }}
                />
              </ReactCrop>
            </div>
          </div>

          {/* Transform Controls */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Transform</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => rotateImage(-90)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                title="Rotate Left"
              >
                <RotateCcw size={16} />
                -90°
              </button>
              <button
                onClick={() => rotateImage(90)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                title="Rotate Right"
              >
                <RotateCw size={16} />
                +90°
              </button>
              <button
                onClick={toggleFlipH}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
                  flipH ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
                title="Flip Horizontal"
              >
                <FlipHorizontal size={16} />
                Flip H
              </button>
              <button
                onClick={toggleFlipV}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
                  flipV ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
                title="Flip Vertical"
              >
                <FlipVertical size={16} />
                Flip V
              </button>
            </div>
          </div>

          {/* Custom Dimensions */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Custom Dimensions</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">W:</span>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 300)}
                  className="w-20 px-2 py-1 text-sm border border-border rounded-md bg-background"
                  min="50"
                  max="5000"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">H:</span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 300)}
                  className="w-20 px-2 py-1 text-sm border border-border rounded-md bg-background"
                  min="50"
                  max="5000"
                />
              </div>
              <button
                onClick={applyCustomDimensions}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => downloadImage('jpg')}
              disabled={!completedCrop || isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download size={16} />
              {isProcessing ? 'Processing...' : 'Download JPG'}
            </button>
            <button
              onClick={() => downloadImage('png')}
              disabled={!completedCrop || isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download size={16} />
              {isProcessing ? 'Processing...' : 'Download PNG'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
