'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, X, Image as ImageIcon, Package, Eye, EyeOff, Type } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface WatermarkResult {
  file: File;
  watermarkedBlob: Blob;
  previewUrl: string;
}

type WatermarkType = 'text' | 'image';
type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITION_LABELS: Record<Position, string> = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'center-left': 'Center Left',
  'center': 'Center',
  'center-right': 'Center Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
};

export function ImageWatermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [text, setText] = useState('© Your Name');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkScale, setWatermarkScale] = useState(0.2);
  const [position, setPosition] = useState<Position>('center');
  const [offsetX, setOffsetX] = useState(10);
  const [offsetY, setOffsetY] = useState(10);
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [results, setResults] = useState<WatermarkResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviews, setShowPreviews] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const validFiles = Array.from(uploadedFiles).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setError('Please upload valid image files (JPG, PNG, WebP)');
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);
    setResults([]);
  };

  const handleWatermarkImageUpload = (uploadedFile: File | null) => {
    if (!uploadedFile) return;
    
    if (!uploadedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file for the watermark');
      return;
    }

    setWatermarkImage(uploadedFile);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  const getPositionCoordinates = (
    imgWidth: number,
    imgHeight: number,
    watermarkWidth: number,
    watermarkHeight: number,
    pos: Position,
    offX: number,
    offY: number
  ): { x: number; y: number } => {
    switch (pos) {
      case 'top-left':
        return { x: offX, y: offY };
      case 'top-center':
        return { x: (imgWidth - watermarkWidth) / 2 + offX, y: offY };
      case 'top-right':
        return { x: imgWidth - watermarkWidth - offX, y: offY };
      case 'center-left':
        return { x: offX, y: (imgHeight - watermarkHeight) / 2 + offY };
      case 'center':
        return { x: (imgWidth - watermarkWidth) / 2 + offX, y: (imgHeight - watermarkHeight) / 2 + offY };
      case 'center-right':
        return { x: imgWidth - watermarkWidth - offX, y: (imgHeight - watermarkHeight) / 2 + offY };
      case 'bottom-left':
        return { x: offX, y: imgHeight - watermarkHeight - offY };
      case 'bottom-center':
        return { x: (imgWidth - watermarkWidth) / 2 + offX, y: imgHeight - watermarkHeight - offY };
      case 'bottom-right':
        return { x: imgWidth - watermarkWidth - offX, y: imgHeight - watermarkHeight - offY };
      default:
        return { x: offX, y: offY };
    }
  };

  const addWatermark = async (
    file: File,
    wmType: WatermarkType
  ): Promise<WatermarkResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        ctx.globalAlpha = opacity;

        if (wmType === 'text') {
          ctx.save();
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = fontColor;
          ctx.textBaseline = 'top';

          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = fontSize;

          // Calculate rotation
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          if (rotation !== 0) {
            ctx.translate(centerX, centerY);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
          }

          const { x, y } = getPositionCoordinates(
            canvas.width,
            canvas.height,
            textWidth,
            textHeight,
            position,
            offsetX,
            offsetY
          );

          ctx.fillText(text, x, y);
          ctx.restore();
        } else if (wmType === 'image' && watermarkImage) {
          const wmImg = new Image();
          const wmUrl = URL.createObjectURL(watermarkImage);

          wmImg.onload = () => {
            URL.revokeObjectURL(wmUrl);

            const wmWidth = img.width * watermarkScale;
            const wmHeight = (wmImg.height * wmWidth) / wmImg.width;

            ctx.save();

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            if (rotation !== 0) {
              ctx.translate(centerX, centerY);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.translate(-centerX, -centerY);
            }

            const { x, y } = getPositionCoordinates(
              canvas.width,
              canvas.height,
              wmWidth,
              wmHeight,
              position,
              offsetX,
              offsetY
            );

            ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);
            ctx.restore();

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const previewUrl = URL.createObjectURL(blob);
                  resolve({
                    file,
                    watermarkedBlob: blob,
                    previewUrl,
                  });
                } else {
                  reject(new Error('Failed to create blob'));
                }
              },
              file.type
            );
          };

          wmImg.onerror = () => {
            URL.revokeObjectURL(wmUrl);
            reject(new Error('Failed to load watermark image'));
          };

          wmImg.src = wmUrl;
        } else {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const previewUrl = URL.createObjectURL(blob);
                resolve({
                  file,
                  watermarkedBlob: blob,
                  previewUrl,
                });
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            file.type
          );
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  const addWatermarks = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      setError('Please upload a watermark image');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const watermarkResults: WatermarkResult[] = [];

      for (const file of files) {
        try {
          const result = await addWatermark(file, watermarkType);
          watermarkResults.push(result);
        } catch (err) {
          console.error('Error processing file:', file.name, err);
        }
      }

      if (watermarkResults.length === 0) {
        setError('Failed to process any images. Please try different images or settings.');
      } else {
        setResults(watermarkResults);
      }
    } catch (err) {
      setError('An error occurred during processing. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIndividual = (result: WatermarkResult, index: number) => {
    const url = result.previewUrl;
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}_watermarked${result.file.name.substring(result.file.name.lastIndexOf('.'))}`;
    a.download = fileName;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;

    const zip = new JSZip();

    results.forEach((result) => {
      const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}_watermarked${result.file.name.substring(result.file.name.lastIndexOf('.'))}`;
      zip.file(fileName, result.watermarkedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watermarked_images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePreview = (index: number) => {
    setShowPreviews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const resetAll = () => {
    setFiles([]);
    setResults([]);
    setError(null);
    setShowPreviews({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            id="image-upload"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div
            ref={dropZoneRef}
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
                Drop images here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP supported • Multiple files allowed
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{files.length} file(s) selected</span>
                <button
                  onClick={resetAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ImageIcon size={16} className="text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-background rounded transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Watermark Settings */}
      {files.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Watermark Settings</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Watermark Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setWatermarkType('text')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors',
                  watermarkType === 'text'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <Type size={16} />
                Text
              </button>
              <button
                onClick={() => setWatermarkType('image')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors',
                  watermarkType === 'image'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <ImageIcon size={16} />
                Image
              </button>
            </div>
          </div>

          {watermarkType === 'text' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Font Size: {fontSize}px
                  </label>
                </div>
                <input
                  type="range"
                  min="12"
                  max="120"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>12px</span>
                  <span>60px</span>
                  <span>120px</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Font Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-12 h-10 border border-border rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bold"
                    checked={fontWeight === 'bold'}
                    onChange={(e) => setFontWeight(e.target.checked ? 'bold' : 'normal')}
                    className="accent-accent"
                  />
                  <label htmlFor="bold" className="text-sm text-foreground">Bold</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="italic"
                    checked={fontStyle === 'italic'}
                    onChange={(e) => setFontStyle(e.target.checked ? 'italic' : 'normal')}
                    className="accent-accent"
                  />
                  <label htmlFor="italic" className="text-sm text-foreground">Italic</label>
                </div>
              </div>
            </>
          )}

          {watermarkType === 'image' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Watermark Image</label>
                <input
                  ref={watermarkImageInputRef}
                  type="file"
                  id="watermark-image-upload"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleWatermarkImageUpload(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="watermark-image-upload"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
                >
                  {watermarkImage ? (
                    <div className="text-center">
                      <ImageIcon size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">{watermarkImage.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload watermark image</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Scale: {Math.round(watermarkScale * 100)}%
                  </label>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={watermarkScale}
                  onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Position</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(POSITION_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPosition(key as Position)}
                  className={cn(
                    'px-3 py-2 text-xs rounded-md transition-colors',
                    position === key
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Offset X (px)</label>
              <input
                type="number"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Offset Y (px)</label>
              <input
                type="number"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Opacity: {Math.round(opacity * 100)}%
              </label>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Rotation: {rotation}°
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0°</span>
              <span>180°</span>
              <span>360°</span>
            </div>
          </div>

          <button
            onClick={addWatermarks}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ImageIcon size={18} />
            {isProcessing ? 'Processing...' : 'Add Watermark'}
          </button>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Results</h3>
            {results.length > 1 && (
              <button
                onClick={downloadAllAsZip}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Package size={16} />
                Download All as ZIP
              </button>
            )}
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-muted rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.file.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className="text-muted-foreground">
                        {formatFileSize(result.file.size)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground font-medium">
                        {formatFileSize(result.watermarkedBlob.size)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePreview(index)}
                      className="p-2 hover:bg-background rounded transition-colors"
                      title="Toggle preview"
                    >
                      {showPreviews[index] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => downloadIndividual(result, index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>

                {showPreviews[index] && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Original</p>
                      <div className="border rounded-lg p-2 bg-background min-h-[160px] flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(result.file)}
                          alt="Original"
                          className="w-full h-auto object-contain max-h-40"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Watermarked</p>
                      <div className="border rounded-lg p-2 bg-background min-h-[160px] flex items-center justify-center">
                        <img
                          src={result.previewUrl}
                          alt="Watermarked"
                          className="w-full h-auto object-contain max-h-40"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
