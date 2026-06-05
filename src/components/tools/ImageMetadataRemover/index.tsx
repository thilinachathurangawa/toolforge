'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, X, Image as ImageIcon, Package, ShieldCheck, MapPin, Camera, Calendar, Info } from 'lucide-react';
import JSZip from 'jszip';
import EXIF from 'exif-js';
import { cn } from '@/lib/utils';

interface MetadataInfo {
  camera?: string;
  model?: string;
  gps?: { latitude: number; longitude: number };
  dateTime?: string;
  software?: string;
  copyright?: string;
  allTags: Record<string, any>;
  hasMetadata: boolean;
}

interface MetadataRemovalResult {
  file: File;
  originalSize: number;
  cleanedBlob: Blob;
  cleanedSize: number;
  metadataRemoved: string[];
  previewUrl: string;
}

const METADATA_TYPES = [
  { id: 'camera', label: 'Camera Info', icon: Camera },
  { id: 'gps', label: 'GPS Location', icon: MapPin },
  { id: 'dateTime', label: 'Date/Time', icon: Calendar },
  { id: 'software', label: 'Software Info', icon: Info },
  { id: 'copyright', label: 'Copyright', icon: Info },
];

export function ImageMetadataRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [metadataInfo, setMetadataInfo] = useState<Map<string, MetadataInfo>>(new Map());
  const [selectedMetadataTypes, setSelectedMetadataTypes] = useState<string[]>(['camera', 'gps', 'dateTime', 'software', 'copyright']);
  const [results, setResults] = useState<MetadataRemovalResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const extractMetadata = (file: File): Promise<MetadataInfo> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        EXIF.getData(img as any, () => {
          const allTags: Record<string, any> = {};
          const allData = EXIF.getAllTags(img as any);
          
          for (const key in allData) {
            if (allData[key] !== undefined && allData[key] !== null) {
              allTags[key] = allData[key];
            }
          }

          const metadata: MetadataInfo = {
            camera: EXIF.getTag(img as any, 'Make') || undefined,
            model: EXIF.getTag(img as any, 'Model') || undefined,
            gps: (EXIF.getTag(img as any, 'GPSLatitude') && EXIF.getTag(img as any, 'GPSLongitude')) 
              ? {
                  latitude: EXIF.getTag(img as any, 'GPSLatitude'),
                  longitude: EXIF.getTag(img as any, 'GPSLongitude'),
                }
              : undefined,
            dateTime: EXIF.getTag(img as any, 'DateTime') || EXIF.getTag(img as any, 'DateTimeOriginal') || undefined,
            software: EXIF.getTag(img as any, 'Software') || undefined,
            copyright: EXIF.getTag(img as any, 'Copyright') || undefined,
            allTags,
            hasMetadata: Object.keys(allTags).length > 0,
          };
          
          URL.revokeObjectURL(url);
          resolve(metadata);
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          allTags: {},
          hasMetadata: false,
        });
      };

      img.src = url;
    });
  };

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const validFiles = Array.from(uploadedFiles).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setError('Please upload valid image files (JPG, PNG, WebP)');
      return;
    }

    setFiles(validFiles);
    setError(null);
    setResults([]);
    setIsAnalyzing(true);

    const metadataMap = new Map<string, MetadataInfo>();
    
    for (const file of validFiles) {
      const metadata = await extractMetadata(file);
      metadataMap.set(file.name, metadata);
    }

    setMetadataInfo(metadataMap);
    setIsAnalyzing(false);
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
    const file = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMetadataInfo((prev) => {
      const newMap = new Map(prev);
      newMap.delete(file.name);
      return newMap;
    });
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMetadataType = (typeId: string) => {
    setSelectedMetadataTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const selectAllMetadataTypes = () => {
    setSelectedMetadataTypes(METADATA_TYPES.map((t) => t.id));
  };

  const clearAllMetadataTypes = () => {
    setSelectedMetadataTypes([]);
  };

  const removeMetadata = async (file: File, typesToRemove: string[]): Promise<MetadataRemovalResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              const metadata = metadataInfo.get(file.name);
              const removedTypes = typesToRemove.filter((type) => {
                if (type === 'camera' && (metadata?.camera || metadata?.model)) return true;
                if (type === 'gps' && metadata?.gps) return true;
                if (type === 'dateTime' && metadata?.dateTime) return true;
                if (type === 'software' && metadata?.software) return true;
                if (type === 'copyright' && metadata?.copyright) return true;
                return false;
              });

              resolve({
                file,
                originalSize: file.size,
                cleanedBlob: blob,
                cleanedSize: blob.size,
                metadataRemoved: removedTypes,
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

  const removeMetadataFromAll = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (selectedMetadataTypes.length === 0) {
      setError('Please select at least one metadata type to remove');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const removalResults: MetadataRemovalResult[] = [];

      for (const file of files) {
        try {
          const result = await removeMetadata(file, selectedMetadataTypes);
          removalResults.push(result);
        } catch (err) {
          console.error('Error removing metadata from file:', file.name, err);
        }
      }

      if (removalResults.length === 0) {
        setError('Failed to remove metadata from any images. Please try again.');
      } else {
        setResults(removalResults);
      }
    } catch (err) {
      setError('An error occurred during metadata removal. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIndividual = (result: MetadataRemovalResult) => {
    const url = result.previewUrl;
    const a = document.createElement('a');
    a.href = url;
    const ext = result.file.name.split('.').pop() || 'jpg';
    a.download = `${result.file.name.replace(/\.[^/.]+$/, '')}_cleaned.${ext}`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;

    const zip = new JSZip();

    results.forEach((result) => {
      const ext = result.file.name.split('.').pop() || 'jpg';
      const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}_cleaned.${ext}`;
      zip.file(fileName, result.cleanedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFiles([]);
    setMetadataInfo(new Map());
    setResults([]);
    setError(null);
    setSelectedMetadataTypes(['camera', 'gps', 'dateTime', 'software', 'copyright']);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
                {files.map((file, index) => {
                  const metadata = metadataInfo.get(file.name);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ImageIcon size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        {metadata?.hasMetadata && (
                          <ShieldCheck size={14} className="text-accent shrink-0" />
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-background rounded transition-colors shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
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

      {/* Metadata Selection */}
      {files.length > 0 && !isAnalyzing && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Metadata to Remove</h3>
            <div className="flex gap-2">
              <button
                onClick={selectAllMetadataTypes}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAllMetadataTypes}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {METADATA_TYPES.map((type) => {
              const Icon = type.icon;
              const hasThisMetadata = Array.from(metadataInfo.values()).some(
                (m) => m[type.id as keyof MetadataInfo]
              );
              
              return (
                <button
                  key={type.id}
                  onClick={() => toggleMetadataType(type.id)}
                  disabled={!hasThisMetadata}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                    selectedMetadataTypes.includes(type.id)
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-muted border-border text-muted-foreground hover:border-accent/50',
                    !hasThisMetadata && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={removeMetadataFromAll}
            disabled={isProcessing || selectedMetadataTypes.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ShieldCheck size={18} />
            {isProcessing ? 'Removing Metadata...' : 'Remove Metadata'}
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="p-6 border border-border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground text-center">Analyzing metadata...</p>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Metadata Removal Results</h3>
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
                        {formatFileSize(result.cleanedSize)}
                      </span>
                    </div>
                    {result.metadataRemoved.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.metadataRemoved.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => downloadIndividual(result)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors shrink-0"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
