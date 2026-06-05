'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, X, Image as ImageIcon, Package, Eye, EyeOff } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface ConversionResult {
  file: File;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  backgroundColor: string;
  convertedBlob: Blob;
  previewUrl: string;
}

type BackgroundColor = 'transparent' | 'white' | 'custom';

export function SvgToPng() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [scale, setScale] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>('transparent');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviews, setShowPreviews] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      file.type === 'image/svg+xml' || file.name.endsWith('.svg')
    );

    if (validFiles.length === 0) {
      setError('Please upload valid SVG files');
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);
    setResults([]);
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

  const getSvgDimensions = (svgContent: string): { width: number; height: number } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) return { width: 100, height: 100 };

    const widthAttr = svgElement.getAttribute('width');
    const heightAttr = svgElement.getAttribute('height');
    const viewBox = svgElement.getAttribute('viewBox');

    let svgWidth = 100;
    let svgHeight = 100;

    if (widthAttr && heightAttr) {
      svgWidth = parseFloat(widthAttr) || 100;
      svgHeight = parseFloat(heightAttr) || 100;
    } else if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(parseFloat);
      if (parts.length === 4) {
        svgWidth = parts[2] || 100;
        svgHeight = parts[3] || 100;
      }
    }

    return { width: svgWidth, height: svgHeight };
  };

  const convertSvgToPng = async (
    file: File,
    outputW: number,
    outputH: number,
    bgColor: string
  ): Promise<ConversionResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        const { width: originalWidth, height: originalHeight } = getSvgDimensions(svgContent);

        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          URL.revokeObjectURL(url);

          const canvas = document.createElement('canvas');
          canvas.width = outputW;
          canvas.height = outputH;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Handle background
          if (bgColor !== 'transparent') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, outputW, outputH);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const previewUrl = URL.createObjectURL(blob);
                resolve({
                  file,
                  originalWidth,
                  originalHeight,
                  outputWidth: outputW,
                  outputHeight: outputH,
                  backgroundColor: bgColor,
                  convertedBlob: blob,
                  previewUrl,
                });
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            'image/png'
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG'));
        };

        img.src = url;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  const convertImages = async () => {
    if (files.length === 0) {
      setError('Please upload at least one SVG file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const conversionResults: ConversionResult[] = [];

      for (const file of files) {
        try {
          const reader = new FileReader();
          const svgContent = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          });

          const { width: originalWidth, height: originalHeight } = getSvgDimensions(svgContent);
          
          let outputW = width;
          let outputH = height;

          if (maintainAspectRatio) {
            const aspectRatio = originalWidth / originalHeight;
            if (scale !== 0) {
              outputW = Math.round(originalWidth * scale);
              outputH = Math.round(originalHeight * scale);
            } else {
              outputH = Math.round(outputW / aspectRatio);
            }
          } else if (scale !== 0) {
            outputW = Math.round(originalWidth * scale);
            outputH = Math.round(originalHeight * scale);
          }

          const bgColor = backgroundColor === 'custom' ? customColor : 
                          backgroundColor === 'white' ? '#ffffff' : 'transparent';

          const result = await convertSvgToPng(file, outputW, outputH, bgColor);
          conversionResults.push(result);
        } catch (err) {
          console.error('Error converting file:', file.name, err);
        }
      }

      if (conversionResults.length === 0) {
        setError('Failed to convert any SVGs. Please try different files or settings.');
      } else {
        setResults(conversionResults);
      }
    } catch (err) {
      setError('An error occurred during conversion. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIndividual = (result: ConversionResult, index: number) => {
    const url = result.previewUrl;
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}.png`;
    a.download = fileName;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;

    const zip = new JSZip();

    results.forEach((result) => {
      const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}.png`;
      zip.file(fileName, result.convertedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_svgs.zip';
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

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    if (newScale !== 0 && maintainAspectRatio) {
      // Dimensions will be calculated based on original SVG during conversion
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
            id="svg-upload"
            accept="image/svg+xml,.svg"
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
              htmlFor="svg-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <Upload size={48} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drop SVG files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                SVG files supported • Multiple files allowed
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

      {/* Output Settings */}
      {files.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Output Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1024)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={scale !== 0 && maintainAspectRatio}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 1024)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={scale !== 0 && maintainAspectRatio}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="maintain-aspect"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="accent-accent"
            />
            <label htmlFor="maintain-aspect" className="text-sm text-foreground">
              Maintain aspect ratio
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scale</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: '0.5x', value: 0.5 },
                { label: '1x', value: 1 },
                { label: '2x', value: 2 },
                { label: '3x', value: 3 },
                { label: '4x', value: 4 },
                { label: 'Custom', value: 0 },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleScaleChange(option.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    scale === option.value
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Background Color</label>
            <select
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value as BackgroundColor)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="transparent">Transparent</option>
              <option value="white">White</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {backgroundColor === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Custom Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-10 border border-border rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          )}

          <button
            onClick={convertImages}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ImageIcon size={18} />
            {isProcessing ? 'Converting...' : 'Convert to PNG'}
          </button>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Conversion Results</h3>
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
                    <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                      <span className="text-muted-foreground">
                        {result.originalWidth}×{result.originalHeight}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground font-medium">
                        {result.outputWidth}×{result.outputHeight}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {formatFileSize(result.convertedBlob.size)}
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
                      <p className="text-xs text-muted-foreground">Original SVG</p>
                      <div className="border rounded-lg p-2 bg-background min-h-[160px] flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(result.file)}
                          alt="Original SVG"
                          className="w-full h-auto object-contain max-h-40"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Converted PNG</p>
                      <div className="border rounded-lg p-2 bg-background min-h-[160px] flex items-center justify-center">
                        <img
                          src={result.previewUrl}
                          alt="Converted PNG"
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
