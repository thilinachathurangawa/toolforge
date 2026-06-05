'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, X, Image as ImageIcon, Package, Eye, EyeOff } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface ResizeResult {
  file: File;
  originalWidth: number;
  originalHeight: number;
  resizedBlob: Blob;
  newWidth: number;
  newHeight: number;
  previewUrl: string;
}

const PRESETS = [
  { name: 'Instagram', width: 1080, height: 1080 },
  { name: 'Facebook', width: 1200, height: 630 },
  { name: 'Twitter', width: 1200, height: 675 },
  { name: 'YouTube', width: 1280, height: 720 },
];

const PERCENTAGES = [25, 50, 75, 100, 200];

export function ImageResizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [percentage, setPercentage] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [results, setResults] = useState<ResizeResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviews, setShowPreviews] = useState<Record<number, boolean>>({});
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  useEffect(() => {
    const updateAspectRatio = async () => {
      if (files.length > 0 && maintainAspectRatio) {
        const dimensions = await getImageDimensions(files[0]);
        if (dimensions.width > 0 && dimensions.height > 0) {
          setAspectRatio(dimensions.width / dimensions.height);
        }
      }
    };
    updateAspectRatio();
  }, [files, maintainAspectRatio]);

  useEffect(() => {
    if (maintainAspectRatio && width > 0) {
      setHeight(Math.round(width / aspectRatio));
    }
  }, [width, maintainAspectRatio, aspectRatio]);

  useEffect(() => {
    if (maintainAspectRatio && height > 0) {
      setWidth(Math.round(height * aspectRatio));
    }
  }, [height, maintainAspectRatio, aspectRatio]);

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const validFiles = Array.from(uploadedFiles).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setError('Please upload valid image files (JPG, PNG, WebP, GIF)');
      return;
    }

    setFiles(validFiles);
    setError(null);
    setResults([]);

    // Get dimensions from first file to set initial aspect ratio
    if (validFiles.length > 0) {
      const dimensions = await getImageDimensions(validFiles[0]);
      if (dimensions.width > 0 && dimensions.height > 0) {
        setAspectRatio(dimensions.width / dimensions.height);
        setWidth(dimensions.width);
        setHeight(dimensions.height);
      }
    }
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

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    if (presetName) {
      const preset = PRESETS.find((p) => p.name === presetName);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
        setPercentage(100);
      }
    }
  };

  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    if (files.length > 0) {
      getImageDimensions(files[0]).then((dimensions) => {
        if (dimensions.width > 0 && dimensions.height > 0) {
          setWidth(Math.round(dimensions.width * (value / 100)));
          setHeight(Math.round(dimensions.height * (value / 100)));
        }
      });
    }
  };

  const resizeImage = (
    file: File,
    targetWidth: number,
    targetHeight: number
  ): Promise<ResizeResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              resolve({
                file,
                originalWidth: img.width,
                originalHeight: img.height,
                resizedBlob: blob,
                newWidth: targetWidth,
                newHeight: targetHeight,
                previewUrl,
              });
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type,
          0.92
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  const resizeImages = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (width <= 0 || height <= 0) {
      setError('Please enter valid width and height');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const resizeResults: ResizeResult[] = [];

      for (const file of files) {
        try {
          const result = await resizeImage(file, width, height);
          resizeResults.push(result);
        } catch (err) {
          console.error('Error resizing file:', file.name, err);
        }
      }

      if (resizeResults.length === 0) {
        setError('Failed to resize any images. Please try different images or settings.');
      } else {
        setResults(resizeResults);
      }
    } catch (err) {
      setError('An error occurred during resizing. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIndividual = (result: ResizeResult, index: number) => {
    const url = result.previewUrl;
    const a = document.createElement('a');
    a.href = url;
    const ext = result.file.name.split('.').pop() || 'jpg';
    a.download = `${result.file.name.replace(/\.[^/.]+$/, '')}_resized.${ext}`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;

    const zip = new JSZip();

    results.forEach((result) => {
      const ext = result.file.name.split('.').pop() || 'jpg';
      const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}_resized.${ext}`;
      zip.file(fileName, result.resizedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resized_images.zip';
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
    setWidth(1920);
    setHeight(1080);
    setPercentage(100);
    setSelectedPreset('');
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
            accept="image/jpeg,image/png,image/webp,image/gif"
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
                JPG, PNG, WebP, GIF supported • Multiple files allowed
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

      {/* Resize Controls */}
      {files.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Width (px)</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Height (px)</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <label htmlFor="aspect-ratio" className="text-sm text-foreground">
              Maintain aspect ratio
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preset</label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">None</option>
                {PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name} ({preset.width}x{preset.height})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Percentage</label>
              <select
                value={percentage}
                onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {PERCENTAGES.map((pct) => (
                  <option key={pct} value={pct}>
                    {pct}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={resizeImages}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ImageIcon size={18} />
            {isProcessing ? 'Resizing...' : 'Resize Images'}
          </button>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Resize Results</h3>
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
                        {result.originalWidth}x{result.originalHeight}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground font-medium">
                        {result.newWidth}x{result.newHeight}
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
                      <div className="border rounded-lg p-2 bg-background min-h-[160px]">
                        <img
                          src={URL.createObjectURL(result.file)}
                          alt="Original"
                          className="w-full h-auto object-contain max-h-40"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Resized</p>
                      <div className="border rounded-lg p-2 bg-background min-h-[160px]">
                        <img
                          src={result.previewUrl}
                          alt="Resized"
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
