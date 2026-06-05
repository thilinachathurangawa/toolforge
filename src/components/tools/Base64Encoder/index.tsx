'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Download, Upload, Image as ImageIcon, FileText, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'text' | 'file' | 'image';
type Mode = 'encode' | 'decode' | 'auto';

export function Base64Encoder() {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [urlSafe, setUrlSafe] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileOutput, setFileOutput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageOutput, setImageOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Text encode/decode functions
  const processText = useCallback(() => {
    try {
      if (!textInput.trim()) {
        setTextOutput('');
        return;
      }

      let result: string;
      const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(textInput.trim()) && textInput.trim().length % 4 === 0;

      if (mode === 'auto') {
        result = isBase64 ? decodeBase64(textInput) : encodeBase64(textInput);
      } else if (mode === 'encode') {
        result = encodeBase64(textInput);
      } else {
        result = decodeBase64(textInput);
      }

      setTextOutput(result);
    } catch (error) {
      setTextOutput('Error: Invalid input for selected mode');
    }
  }, [textInput, mode]);

  const encodeBase64 = (str: string): string => {
    const encoded = btoa(unescape(encodeURIComponent(str)));
    return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
  };

  const decodeBase64 = (str: string): string => {
    let decoded = str;
    if (urlSafe) {
      decoded = decoded.replace(/-/g, '+').replace(/_/g, '/');
      while (decoded.length % 4) decoded += '=';
    }
    return decodeURIComponent(escape(atob(decoded)));
  };

  // File to Base64
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileOutput(result.split(',')[1] || result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  // Image to Base64
  const handleImageUpload = (uploadedFile: File) => {
    setImageFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setImageOutput(result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download output
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auto-process text on change
  React.useEffect(() => {
    if (activeTab === 'text' && mode === 'auto') {
      processText();
    }
  }, [textInput, mode, activeTab, processText]);

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation */}
      <div className="grid w-full grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab('text')}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'text'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          <FileText size={16} />
          Text
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'file'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          <Upload size={16} />
          File
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'image'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          <ImageIcon size={16} />
          Image
        </button>
      </div>

      {/* Text Tab */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            <textarea
              placeholder="Enter text to encode or Base64 to decode..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode('encode')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  mode === 'encode'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  mode === 'decode'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                Decode
              </button>
              <button
                onClick={() => setMode('auto')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  mode === 'auto'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                Auto
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="rounded"
              />
              URL-safe
            </label>

            {mode !== 'auto' && (
              <button
                onClick={processText}
                className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                Process
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <textarea
              readOnly
              value={textOutput}
              className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
              placeholder="Output will appear here..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(textOutput)}
              disabled={!textOutput}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => handleDownload(textOutput, 'base64-output.txt')}
              disabled={!textOutput}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => {
                setTextInput('');
                setTextOutput('');
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* File Tab */}
      {activeTab === 'file' && (
        <div className="p-6 border border-border rounded-xl bg-card">
          <div className="space-y-4">
            <div className="drop-zone">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload size={48} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Any file type supported
                </p>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium truncate">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 hover:bg-background rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {fileOutput && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Base64 Output</label>
                <textarea
                  readOnly
                  value={fileOutput}
                  className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(fileOutput)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => handleDownload(fileOutput, `${file?.name || 'file'}.base64`)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Tab */}
      {activeTab === 'image' && (
        <div className="p-6 border border-border rounded-xl bg-card">
          <div className="space-y-4">
            <div className="drop-zone">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <ImageIcon size={48} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WebP
                </p>
              </label>
            </div>

            {imageFile && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium truncate">{imageFile.name}</span>
                <button
                  onClick={() => setImageFile(null)}
                  className="p-1 hover:bg-background rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {imageUrl && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Preview</label>
                  <div className="mt-2 border rounded-lg p-4 flex justify-center bg-muted/50 min-h-[300px]">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Base64 Output</label>
                  <textarea
                    readOnly
                    value={imageOutput}
                    className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(imageOutput)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDownload(imageOutput, `${imageFile?.name || 'image'}.base64`)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
