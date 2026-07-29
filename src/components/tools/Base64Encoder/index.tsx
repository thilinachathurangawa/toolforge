'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Download, Upload, Image as ImageIcon, FileText, Check, X, History, AlertTriangle, Settings, ChevronDown, ChevronUp, RefreshCw, Scissors, Merge, Hash, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'text' | 'file' | 'image' | 'decode';
type Mode = 'encode' | 'decode' | 'auto';
type Encoding = 'utf-8' | 'ascii' | 'utf-16';
type ImageFormat = 'data-uri' | 'css' | 'html';
type HistoryItem = {
  id: string;
  input: string;
  output: string;
  mode: Mode;
  timestamp: number;
};

export function Base64Encoder() {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [urlSafe, setUrlSafe] = useState(false);
  const [encoding, setEncoding] = useState<Encoding>('utf-8');
  const [lineWrap, setLineWrap] = useState(false);
  const [lineLength, setLineLength] = useState(76);
  const [customPadding, setCustomPadding] = useState<'default' | 'add' | 'remove'>('default');
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileOutput, setFileOutput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageOutput, setImageOutput] = useState('');
  const [imageFormat, setImageFormat] = useState<ImageFormat>('data-uri');
  const [resizeWidth, setResizeWidth] = useState<number | null>(null);
  const [resizeHeight, setResizeHeight] = useState<number | null>(null);
  const [convertFormat, setConvertFormat] = useState<string>('original');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunks, setChunks] = useState<string[]>([]);
  const [mergedOutput, setMergedOutput] = useState('');
  const [hashVerify, setHashVerify] = useState(false);
  const [hashMatch, setHashMatch] = useState<boolean | null>(null);
  const [compress, setCompress] = useState(false);
  const [inputSize, setInputSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Text encode/decode functions
  const processText = useCallback(() => {
    try {
      setError('');
      if (!textInput.trim()) {
        setTextOutput('');
        setInputSize(0);
        setOutputSize(0);
        return;
      }

      setInputSize(new Blob([textInput]).size);

      let result: string;
      const validation = validateBase64(textInput.trim());

      if (mode === 'auto') {
        result = validation.isValid ? decodeBase64(textInput) : encodeBase64(textInput);
      } else if (mode === 'encode') {
        result = encodeBase64(textInput);
      } else {
        if (!validation.isValid) {
          setError(validation.error || 'Invalid Base64 input');
          return;
        }
        result = decodeBase64(textInput);
      }

      // Apply line wrapping
      if (lineWrap && mode !== 'decode') {
        result = wrapLines(result, lineLength);
      }

      // Apply custom padding
      result = applyPadding(result, customPadding);

      setTextOutput(result);
      setOutputSize(new Blob([result]).size);

      // Hash verification
      if (hashVerify && mode === 'decode') {
        const originalHash = simpleHash(textInput);
        const decodedHash = simpleHash(result);
        setHashMatch(originalHash === decodedHash);
      }

      // Add to history
      addToHistory(textInput, result, mode);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed');
      setTextOutput('');
    }
  }, [textInput, mode, urlSafe, encoding, lineWrap, lineLength, customPadding, hashVerify]);

  const validateBase64 = (str: string): { isValid: boolean; error?: string } => {
    const trimmed = str.trim();
    if (!trimmed) return { isValid: false, error: 'Empty input' };

    // Check for valid Base64 characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(trimmed)) {
      return { isValid: false, error: 'Contains invalid Base64 characters' };
    }

    // Check length
    if (trimmed.length % 4 !== 0) {
      return { isValid: false, error: 'Invalid Base64 length (must be multiple of 4)' };
    }

    // Try to decode
    try {
      atob(trimmed);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Failed to decode - invalid Base64 string' };
    }
  };

  const encodeBase64 = (str: string): string => {
    let encoded: string;
    
    if (encoding === 'utf-8') {
      encoded = btoa(unescape(encodeURIComponent(str)));
    } else if (encoding === 'ascii') {
      encoded = btoa(str);
    } else {
      // UTF-16
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      bytes.forEach(byte => binary += String.fromCharCode(byte));
      encoded = btoa(binary);
    }

    if (urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    return encoded;
  };

  const decodeBase64 = (str: string): string => {
    let decoded = str.trim();
    
    if (urlSafe) {
      decoded = decoded.replace(/-/g, '+').replace(/_/g, '/');
      while (decoded.length % 4) decoded += '=';
    }

    const binary = atob(decoded);
    
    if (encoding === 'utf-8') {
      return decodeURIComponent(escape(binary));
    } else if (encoding === 'ascii') {
      return binary;
    } else {
      // UTF-16
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder('utf-16le');
      return decoder.decode(bytes);
    }
  };

  const encodeBase32 = (str: string): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of bytes) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        result += alphabet[(value >>> bits) & 31];
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }

    while (result.length % 8) {
      result += '=';
    }

    return result;
  };

  const decodeBase32 = (str: string): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleanStr = str.toUpperCase().replace(/[^A-Z2-7=]/g, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (const char of cleanStr) {
      if (char === '=') break;
      const index = alphabet.indexOf(char);
      if (index === -1) continue;
      
      value = (value << 5) | index;
      bits += 5;
      
      if (bits >= 8) {
        bits -= 8;
        bytes.push((value >>> bits) & 255);
      }
    }

    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  };

  const hexToBase64 = (hex: string): string => {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    if (cleanHex.length % 2 !== 0) {
      throw new Error('Invalid hex string');
    }
    
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  };

  const wrapLines = (str: string, length: number): string => {
    const result: string[] = [];
    for (let i = 0; i < str.length; i += length) {
      result.push(str.slice(i, i + length));
    }
    return result.join('\n');
  };

  const applyPadding = (str: string, padding: 'default' | 'add' | 'remove'): string => {
    if (padding === 'add') {
      while (str.length % 4) str += '=';
    } else if (padding === 'remove') {
      str = str.replace(/=+$/, '');
    }
    return str;
  };

  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };

  const addToHistory = (input: string, output: string, mode: Mode) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      input: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
      output: output.slice(0, 50) + (output.length > 50 ? '...' : ''),
      mode,
      timestamp: Date.now()
    };
    
    setHistory(prev => [newItem, ...prev].slice(0, 10));
  };

  const compressData = async (data: string): Promise<string> => {
    if (typeof CompressionStream === 'undefined') {
      return data; // Fallback if compression not supported
    }
    
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    await writer.write(new TextEncoder().encode(data));
    await writer.close();
    
    const compressedChunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) compressedChunks.push(value);
    }
    
    // Combine all chunks
    const totalLength = compressedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of compressedChunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Convert to binary string
    let binary = '';
    for (let i = 0; i < combined.length; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    
    return btoa(binary);
  };

  // File to Base64
  const handleFileUpload = (uploadedFile: File) => {
    // File size warning
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError(`Warning: File is large (${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB). Processing may be slow.`);
    }
    
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileOutput(result.split(',')[1] || result);
      setInputSize(uploadedFile.size);
      setOutputSize(new Blob([result]).size);
    };
    reader.readAsDataURL(uploadedFile);
  };

  // Multiple file upload
  const handleMultipleFileUpload = (uploadedFiles: FileList) => {
    const filesArray = Array.from(uploadedFiles);
    setImageFiles(filesArray);
    
    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Store results in a map or process batch
      };
      reader.readAsDataURL(file);
    });
  };

  // Image to Base64 with format options
  const handleImageUpload = (uploadedFile: File) => {
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError(`Warning: Image is large (${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB). Processing may be slow.`);
    }
    
    setImageFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      
      // Apply format options
      let formattedOutput = result;
      if (imageFormat === 'css') {
        formattedOutput = `background-image: url('${result}');`;
      } else if (imageFormat === 'html') {
        formattedOutput = `<img src="${result}" alt="${uploadedFile.name}" />`;
      }
      
      setImageOutput(formattedOutput);
      setInputSize(uploadedFile.size);
      setOutputSize(new Blob([formattedOutput]).size);
    };
    reader.readAsDataURL(uploadedFile);
  };

  // Image resizing
  const resizeImage = (file: File, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    });
  };

  // Image format conversion
  const convertImageFormat = async (file: File, targetFormat: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const mimeType = targetFormat === 'webp' ? 'image/webp' : 
                        targetFormat === 'png' ? 'image/png' : 
                        targetFormat === 'jpg' ? 'image/jpeg' : file.type;
        
        resolve(canvas.toDataURL(mimeType, 0.9));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    });
  };

  // Base64 to file/image decode
  const decodeBase64ToFile = (base64: string, filename: string) => {
    try {
      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to decode Base64 to file');
    }
  };

  // Split Base64 into chunks
  const splitBase64 = (base64: string, size: number) => {
    const chunks: string[] = [];
    for (let i = 0; i < base64.length; i += size) {
      chunks.push(base64.slice(i, i + size));
    }
    setChunks(chunks);
  };

  // Merge Base64 chunks
  const mergeChunks = (chunkList: string[]) => {
    const merged = chunkList.join('');
    setMergedOutput(merged);
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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, tab: Tab) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (tab === 'file') {
        handleFileUpload(files[0]);
      } else if (tab === 'image') {
        handleImageUpload(files[0]);
      }
    }
  };

  // Auto-process text on change
  React.useEffect(() => {
    if (activeTab === 'text' && mode === 'auto') {
      processText();
    }
  }, [textInput, mode, activeTab, processText]);

  return (
    <div className="w-full space-y-6">
      {/* Header with History */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Base64 Encoder & Decoder</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          <History size={16} />
          History
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="p-4 border border-border rounded-xl bg-card">
          <h3 className="text-sm font-medium mb-3">Recent Conversions</h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-muted rounded-md text-xs cursor-pointer hover:bg-muted/80"
                  onClick={() => {
                    setTextInput(item.input);
                    setMode(item.mode);
                  }}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{item.mode.toUpperCase()}</span>
                    <span className="text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-muted-foreground">
                    {item.input} → {item.output}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="grid w-full grid-cols-4 gap-2 p-1 bg-muted rounded-lg">
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
        <button
          onClick={() => setActiveTab('decode')}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'decode'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          <RefreshCw size={16} />
          Decode
        </button>
      </div>

      {/* Text Tab */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Settings size={16} />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="p-4 border border-border rounded-xl bg-card space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character Encoding</label>
                  <select
                    value={encoding}
                    onChange={(e) => setEncoding(e.target.value as Encoding)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    <option value="utf-8">UTF-8</option>
                    <option value="ascii">ASCII</option>
                    <option value="utf-16">UTF-16</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Padding</label>
                  <select
                    value={customPadding}
                    onChange={(e) => setCustomPadding(e.target.value as 'default' | 'add' | 'remove')}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    <option value="default">Default</option>
                    <option value="add">Add Padding</option>
                    <option value="remove">Remove Padding</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Line Wrap</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lineWrap}
                      onChange={(e) => setLineWrap(e.target.checked)}
                      className="rounded"
                    />
                    {lineWrap && (
                      <input
                        type="number"
                        value={lineLength}
                        onChange={(e) => setLineLength(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm bg-background border border-input rounded-md"
                        min="1"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hashVerify}
                    onChange={(e) => setHashVerify(e.target.checked)}
                    className="rounded"
                  />
                  Hash Verification
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={compress}
                    onChange={(e) => setCompress(e.target.checked)}
                    className="rounded"
                  />
                  Compress (gzip)
                </label>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Input</label>
              {inputSize > 0 && (
                <span className="text-xs text-muted-foreground">
                  {inputSize.toLocaleString()} bytes
                </span>
              )}
            </div>
            <textarea
              placeholder="Enter text to encode or Base64 to decode..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* Mode Selection */}
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

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertTriangle size={16} className="text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Hash Verification Result */}
          {hashVerify && hashMatch !== null && (
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-md',
              hashMatch ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            )}>
              <Hash size={16} className={hashMatch ? 'text-green-500' : 'text-red-500'} />
              <span className={cn('text-sm', hashMatch ? 'text-green-500' : 'text-red-500')}>
                {hashMatch ? 'Hash verification passed' : 'Hash verification failed'}
              </span>
            </div>
          )}

          {/* Output Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Output</label>
              {outputSize > 0 && (
                <span className="text-xs text-muted-foreground">
                  {outputSize.toLocaleString()} bytes
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={textOutput}
              className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
              placeholder="Output will appear here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
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
              onClick={() => splitBase64(textOutput, chunkSize)}
              disabled={!textOutput}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Scissors size={16} />
              Split
            </button>
            <button
              onClick={() => {
                setTextInput('');
                setTextOutput('');
                setError('');
                setInputSize(0);
                setOutputSize(0);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          </div>

          {/* Chunks Display */}
          {chunks.length > 0 && (
            <div className="p-4 border border-border rounded-xl bg-card space-y-2">
              <h3 className="text-sm font-medium">Split Chunks ({chunks.length})</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {chunks.map((chunk, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-xs font-mono">
                    Chunk {index + 1}: {chunk.slice(0, 50)}...
                  </div>
                ))}
              </div>
              <button
                onClick={() => mergeChunks(chunks)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                <Merge size={16} />
                Merge Chunks
              </button>
            </div>
          )}

          {/* Merged Output */}
          {mergedOutput && (
            <div className="p-4 border border-border rounded-xl bg-card space-y-2">
              <h3 className="text-sm font-medium">Merged Output</h3>
              <textarea
                readOnly
                value={mergedOutput}
                className="w-full min-h-[80px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(mergedOutput)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setMergedOutput('')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <X size={16} />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Tab */}
      {activeTab === 'file' && (
        <div className="p-6 border border-border rounded-xl bg-card">
          <div className="space-y-4">
            <div
              className={cn(
                'drop-zone border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'file')}
            >
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
                <Upload size={48} className={cn('mb-2', isDragging ? 'text-accent' : 'text-muted-foreground')} />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Any file type supported (max 10MB recommended)
                </p>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle size={16} className="text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setFileOutput('');
                    setError('');
                    setInputSize(0);
                    setOutputSize(0);
                  }}
                  className="p-1 hover:bg-background rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {fileOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Base64 Output</label>
                  <span className="text-xs text-muted-foreground">
                    {outputSize.toLocaleString()} bytes
                  </span>
                </div>
                <textarea
                  readOnly
                  value={fileOutput}
                  className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
                />
                <div className="flex flex-wrap gap-2">
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
                  <button
                    onClick={() => splitBase64(fileOutput, chunkSize)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    <Scissors size={16} />
                    Split
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
            {/* Image Format Options */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium">Output Format:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImageFormat('data-uri')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    imageFormat === 'data-uri'
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  Data URI
                </button>
                <button
                  onClick={() => setImageFormat('css')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    imageFormat === 'css'
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  CSS
                </button>
                <button
                  onClick={() => setImageFormat('html')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    imageFormat === 'html'
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  HTML
                </button>
              </div>
            </div>

            {/* Image Resize Options */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium">Resize (optional):</label>
              <input
                type="number"
                placeholder="Width"
                value={resizeWidth || ''}
                onChange={(e) => setResizeWidth(e.target.value ? Number(e.target.value) : null)}
                className="w-24 px-2 py-1 text-sm bg-background border border-input rounded-md"
              />
              <span className="text-sm text-muted-foreground">×</span>
              <input
                type="number"
                placeholder="Height"
                value={resizeHeight || ''}
                onChange={(e) => setResizeHeight(e.target.value ? Number(e.target.value) : null)}
                className="w-24 px-2 py-1 text-sm bg-background border border-input rounded-md"
              />
              <button
                onClick={() => {
                  setResizeWidth(null);
                  setResizeHeight(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>

            {/* Format Conversion */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium">Convert to:</label>
              <select
                value={convertFormat}
                onChange={(e) => setConvertFormat(e.target.value)}
                className="px-3 py-1.5 text-sm bg-background border border-input rounded-md"
              >
                <option value="original">Original</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {/* Drop Zone */}
            <div
              className={cn(
                'drop-zone border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(e.target.files[0]);
                    if (e.target.files.length > 1) {
                      handleMultipleFileUpload(e.target.files);
                    }
                  }
                }}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <ImageIcon size={48} className={cn('mb-2', isDragging ? 'text-accent' : 'text-muted-foreground')} />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WebP (multiple files supported)
                </p>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle size={16} className="text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {imageFile && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{imageFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(imageFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImageUrl(null);
                    setImageOutput('');
                    setError('');
                    setInputSize(0);
                    setOutputSize(0);
                  }}
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Base64 Output</label>
                    <span className="text-xs text-muted-foreground">
                      {outputSize.toLocaleString()} bytes
                    </span>
                  </div>
                  <textarea
                    readOnly
                    value={imageOutput}
                    className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
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
                    <button
                      onClick={() => decodeBase64ToFile(imageOutput, `${imageFile?.name || 'image'}`)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <RefreshCw size={16} />
                      Decode to File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decode Tab - Base64 to File */}
      {activeTab === 'decode' && (
        <div className="p-6 border border-border rounded-xl bg-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Paste Base64 String</label>
              <textarea
                placeholder="Paste your Base64 string here to decode and download as file..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Output Filename</label>
              <input
                type="text"
                placeholder="decoded-file"
                defaultValue="decoded-file"
                id="decode-filename"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
              />
            </div>

            <button
              onClick={() => {
                const filename = (document.getElementById('decode-filename') as HTMLInputElement)?.value || 'decoded-file';
                decodeBase64ToFile(textInput, filename);
              }}
              disabled={!textInput}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={16} />
              Decode & Download
            </button>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle size={16} className="text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Supported Base64 Formats:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Standard Base64 strings</li>
                <li>• Data URIs (data:image/png;base64,...)</li>
                <li>• URL-safe Base64 (with - and _)</li>
                <li>• Any file type encoded in Base64</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
