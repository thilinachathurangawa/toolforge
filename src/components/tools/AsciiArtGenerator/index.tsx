'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Copy, Check, X, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AsciiArtGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [asciiOutput, setAsciiOutput] = useState<string>('');
  const [characterSet, setCharacterSet] = useState<'standard' | 'simple' | 'complex' | 'blocks'>('standard');
  const [outputWidth, setOutputWidth] = useState(80);
  const [invertColors, setInvertColors] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const characterSets = {
    standard: '@%#*+=-:. ',
    simple: '@#*+=-:. ',
    complex: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
    blocks: '█▓▒░ ',
  };

  const handleImageUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, GIF)');
      return;
    }

    setImageFile(uploadedFile);
    setError(null);
    setAsciiOutput('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const generateAscii = useCallback(async () => {
    if (!imageRef.current || !imageUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate aspect ratio
      const aspectRatio = img.height / img.width;
      const canvasHeight = Math.floor(outputWidth * aspectRatio * 0.5); // 0.5 to account for character aspect ratio

      canvas.width = outputWidth;
      canvas.height = canvasHeight;

      ctx.drawImage(img, 0, 0, outputWidth, canvasHeight);

      const imageData = ctx.getImageData(0, 0, outputWidth, canvasHeight);
      const pixels = imageData.data;
      const chars = characterSets[characterSet];
      let ascii = '';

      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < outputWidth; x++) {
          const offset = (y * outputWidth + x) * 4;
          const r = pixels[offset];
          const g = pixels[offset + 1];
          const b = pixels[offset + 2];

          // Calculate brightness
          let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          if (invertColors) {
            brightness = 1 - brightness;
          }

          const charIndex = Math.floor(brightness * (chars.length - 1));
          ascii += chars[charIndex];
        }
        ascii += '\n';
      }

      setAsciiOutput(ascii);
    } catch (err) {
      setError('Failed to generate ASCII art. Please try a different image.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, characterSet, outputWidth, invertColors]);

  const handleCopy = () => {
    navigator.clipboard.writeText(asciiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([asciiOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <img ref={imageRef} src={imageUrl || ''} alt="Upload image for ASCII art conversion" className="hidden" crossOrigin="anonymous" />

      {/* Upload Section */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <div className="space-y-4">
          <input
            type="file"
            id="image-upload"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, GIF supported
            </p>
          </label>

          {imageFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium truncate">{imageFile.name}</span>
              <button
                onClick={() => {
                  setImageFile(null);
                  setImageUrl(null);
                  setAsciiOutput('');
                  setError(null);
                }}
                className="p-1 hover:bg-background rounded transition-colors"
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

      {/* Controls Section */}
      {imageUrl && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Character Set
              </label>
              <select
                value={characterSet}
                onChange={(e) => setCharacterSet(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                <option value="standard">Standard</option>
                <option value="simple">Simple</option>
                <option value="complex">Complex</option>
                <option value="blocks">Blocks</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Output Width: {outputWidth}
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={outputWidth}
                onChange={(e) => setOutputWidth(parseInt(e.target.value))}
                className="w-48 accent-accent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="invert-colors"
                checked={invertColors}
                onChange={(e) => setInvertColors(e.target.checked)}
                className="accent-accent"
              />
              <label htmlFor="invert-colors" className="text-sm text-foreground">
                Invert Colors
              </label>
            </div>

            <button
              onClick={generateAscii}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Type size={18} />
              {isProcessing ? 'Generating...' : 'Generate ASCII'}
            </button>
          </div>
        </div>
      )}

      {/* Output Section */}
      {asciiOutput && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">ASCII Output</h3>
          
          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre text-foreground">
              {asciiOutput}
            </pre>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={downloadAsTxt}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              Download .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
