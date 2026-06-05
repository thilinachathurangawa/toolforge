'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, X, Image as ImageIcon, Package, Eye, EyeOff } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  compressionRatio: number;
  previewUrl: string;
}

export function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [results, setResults] = useState<CompressionResult[]>([]);
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
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setError('Please upload valid image files (JPG, PNG, WebP, GIF)');
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

  const compressImages = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const compressionResults: CompressionResult[] = [];

      for (const file of files) {
        const options = {
          maxSizeMB: 10,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: quality,
        };

        try {
          const compressedBlob = await imageCompression(file, options);
          const previewUrl = URL.createObjectURL(compressedBlob);
          const originalSize = file.size;
          const compressedSize = compressedBlob.size;
          const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

          compressionResults.push({
            file,
            originalSize,
            compressedBlob,
            compressedSize,
            compressionRatio,
            previewUrl,
          });
        } catch (err) {
          console.error('Error compressing file:', file.name, err);
          // Skip files that fail to compress but continue with others
        }
      }

      if (compressionResults.length === 0) {
        setError('Failed to compress any images. Please try different images or settings.');
      } else {
        setResults(compressionResults);
      }
    } catch (err) {
      setError('An error occurred during compression. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIndividual = (result: CompressionResult, index: number) => {
    const url = result.previewUrl;
    const a = document.createElement('a');
    a.href = url;
    const ext = result.file.name.split('.').pop() || 'jpg';
    a.download = `${result.file.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;

    const zip = new JSZip();

    results.forEach((result, index) => {
      const ext = result.file.name.split('.').pop() || 'jpg';
      const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;
      zip.file(fileName, result.compressedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed_images.zip';
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

      {/* Quality Slider and Compress Button */}
      {files.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Quality: {Math.round(quality * 100)}%
              </label>
              <span className="text-xs text-muted-foreground">
                (Lower = smaller file, Higher = better quality)
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            onClick={compressImages}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ImageIcon size={18} />
            {isProcessing ? 'Compressing...' : 'Compress Images'}
          </button>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Compression Results</h3>
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
                        {formatFileSize(result.originalSize)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground font-medium">
                        {formatFileSize(result.compressedSize)}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded',
                          result.compressionRatio > 0
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        )}
                      >
                        {result.compressionRatio > 0
                          ? `-${result.compressionRatio.toFixed(1)}%`
                          : `+${Math.abs(result.compressionRatio).toFixed(1)}%`}
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
                      <p className="text-xs text-muted-foreground">Compressed</p>
                      <div className="border rounded-lg p-2 bg-background min-h-[160px]">
                        <img
                          src={result.previewUrl}
                          alt="Compressed"
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
